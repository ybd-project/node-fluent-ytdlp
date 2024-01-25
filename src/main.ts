/**
 * Fluent-ytdlp - Copyright © 2023 YBD Project - MIT License
 */

'use strict';

import {spawn, execFile, exec, ChildProcessWithoutNullStreams, ChildProcess, ExecFileException, ExecException} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import arch from 'arch';
import Log from './functions/log';
import option from './functions/option';

type Platform = 'windows' | 'linux' | 'macos';
type YTDlpOptionsData = {[key: string]: string | number | boolean | RegExp | Date | object | null};

type SpawnOptions = {
    cwd: string;
    env: any;
    argv0: string;
    stdio: any;
    detached: boolean;
    uid: number;
    gid: number;
    serialization: any;
    shell: boolean | string;
    windowsVerbatimArguments: boolean;
    windowsHide: boolean;
    signal: AbortSignal;
    timeout: number;
    killSignal: any;
};

type RunOptions = {
    force?: boolean;
    spawnOptions?: SpawnOptions;
};

type scheduleRunOptions = {
    force?: boolean;
    spawnOptions?: SpawnOptions;
    schedule: string;
};

type NoStreamRunOptions = {
    type: 'exec' | 'execFile';
    callback: (error: ExecFileException | ExecException | null, stdout: string, stderr: string) => void;
    force?: boolean;
};

const noParamText = 'Option with no parameter',
    {binaryPath, os} = (() => {
        try {
            return JSON.parse(fs.readFileSync(path.join(__dirname + '/../bin/info.json'), 'utf8'));
        } catch (err) {
            console.log('[FLUENT-YTDLP]: yt-dlp等がダウンロードされた際に生成されるJSONファイルが読み込めないため、「setBinaryPath();」でパスを設定してください。');
            return {
                binaryPath: {
                    ytdlp: '',
                    ffmpeg: '',
                    ffprobe: '',
                    folder: '',
                },
                os: {
                    platform: <Platform>(() => {
                        //ここでwindows・linux・macosの三種類に分別する
                        let platform: string = '';
                        switch (process.platform) {
                            case 'win32':
                            case 'cygwin': {
                                //Windows系OS
                                platform = 'windows';
                                break;
                            }
                            case 'linux':
                            case 'aix':
                            case 'freebsd':
                            case 'haiku':
                            case 'netbsd':
                            case 'openbsd':
                            case 'sunos': {
                                //Linux系OS
                                platform = 'linux';
                                break;
                            }
                            case 'darwin': {
                                //Mac系OS
                                platform = 'macos';
                                break;
                            }
                            case 'android': {
                                //対象外のOS
                                throw new Error('このOSは対象外です。\nWindows系、Linux系、Mac系に該当するOSの場合は「https://github.com/ybd-project/node-fluent-ytdlp」にIssuesを立ててください。');
                                break;
                            }
                            default: {
                                //判定の対象外のOS
                                platform = 'linux';
                                break;
                            }
                        }
                        return platform;
                    })(),
                    arch: arch(),
                },
            };
        }
    })();

//yt-dlpのオプションを生成する
function generateOption({debug, wrongOption, options}: {debug: boolean; wrongOption: Array<string>; options: YTDlpOptionsData}, runOptions: RunOptions | NoStreamRunOptions): Array<any> {
    const logger = new Log('generateOption', debug),
        exception = ['url', 'width', 'height', 'filename', 'extension'],
        optionData = Object.entries(options).reduce<any>((previous, [name, param]) => {
            if (wrongOption.includes(name)) {
                if (runOptions.force !== true) {
                    logger.warning('[' + name + ']は間違った引数が指定されている可能性があるため適応されませんでした。');
                    return previous;
                }
                logger.warning('[' + name + ']は間違った引数が指定されている可能性がありますが、設定により強制的に適応されます。');
            }
            if (exception.includes(name) && param !== null) {
                if (name === 'url') {
                    previous.push(param);
                } else if (name === 'width' || name === 'height') {
                    if (!previous.includes('--format')) {
                        const format = (() => {
                            let base = 'bestvideo[' + name + '=' + param + ']';
                            if ((name === 'width' && !options['height']) || (name === 'height' && !options['width'])) {
                                base += '+bestaudio';
                            }
                            return base;
                        })();
                        previous.push('--format');
                        previous.push(format);
                    } else {
                        previous[previous.indexOf('--format') + 1] += '[' + name + '=' + param + ']+bestaudio';
                    }
                } else if (name === 'filename') {
                    const output = '"' + param + '.%(ext)s"';
                    if (!previous.includes('--output')) {
                        previous.push('--output');
                        previous.push(output);
                    } else {
                        previous[previous.indexOf('--output') + 1] = output;
                    }
                } else if (name === 'extension') {
                    if (!previous.includes('--merge-output-format')) {
                        previous.push('--merge-output-format');
                        previous.push(param);
                    } else {
                        previous[previous.indexOf('----merge-output-format') + 1] = param;
                    }
                }
            } else {
                previous.push('--' + option.decode(name));
                if (param !== noParamText && param !== null) {
                    previous.push(param);
                }
            }
            return previous;
        }, []);

    if (!optionData.includes('--ffmpeg-location')) {
        optionData.push('--ffmpeg-location');
        optionData.push(binaryPath.folder);
    }

    return optionData;
}

//yt-dlpのプロセスが終了（close）したときに呼び出しされる関数
function childProcessCloseEvent(code: number): void {
    const logger = new Log('ChildProcessCloseEvent', true);
    const text = '処理は、コード「' + code + '」で終了しました。';
    if (code == 0) {
        logger.success(text);
    } else {
        logger.error(text);
    }
}

//YYYYMMDDの形式の日付文字列を生成する
function createDate(date: Date): string {
    //参考: https://qiita.com/TKFM21/items/88c3d89b3c0666217b56
    return date.getFullYear().toString() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
}

class fluentYTDlp {
    private options: YTDlpOptionsData = {};
    private wrongOption: Array<string> = [];
    private debug = false;

    constructor(url: string, debug: boolean = false) {
        //new FluentYTDlp('URL');
        this.debug = debug;
        const logger = new Log('Constructor', this.debug);
        if (!url) {
            logger.warning('インスタンス生成時にURLは指定されませんでした。');
            this.wrongOption.push('url');
        }
        this.options.url = url;
    }

    /* yt-dlpなどのバイナリパスの設定 */
    setBinaryPath = function ({ytdlp, ffmpeg, ffprobe}: {ytdlp?: string; ffmpeg?: string; ffprobe?: string}) {
        if (ytdlp) {
            binaryPath.ytdlp = ytdlp;
            binaryPath.folder = path.dirname(ytdlp);
        }
        if (ffmpeg) {
            binaryPath.ffmpeg = ffmpeg;
            binaryPath.folder = path.dirname(ffmpeg);
        }
        if (ffprobe) {
            binaryPath.ffprobe = ffprobe;
            binaryPath.folder = path.dirname(ffprobe);
        }
    };

    /* yt-dlpの実行に関するオプション */
    run = function (this: fluentYTDlp, runOptions: RunOptions = {}): ChildProcessWithoutNullStreams {
        //run()
        const logger = new Log('Run', this.debug),
            options = generateOption({debug: this.debug, wrongOption: this.wrongOption, options: this.options}, runOptions),
            ytdlpProcess = spawn(binaryPath.ytdlp, options, runOptions.spawnOptions || {shell: true});

        logger.log('OK');

        if (this.debug === true) {
            ytdlpProcess.on('close', childProcessCloseEvent);
        }

        return ytdlpProcess;
    };
    scheduleRun = function (this: fluentYTDlp, runOptions: scheduleRunOptions = {schedule: ''}): Promise<ChildProcessWithoutNullStreams> {
        //scheduleRun()
        const logger = new Log('ScheduleRun', this.debug),
            options = generateOption({debug: this.debug, wrongOption: this.wrongOption, options: this.options}, runOptions),
            waitTime = Math.floor(new Date(runOptions.schedule || '').getTime() - Date.now());

        return new Promise((resolve, reject) => {
            if (!runOptions.schedule || typeof runOptions.schedule !== 'string' || Math.sign(waitTime) === -1) {
                reject('スケジュールの値がないか過去の時刻を指定している場合があります。');
            } else {
                setTimeout(() => {
                    const ytdlpProcess = spawn(binaryPath.ytdlp, options, runOptions.spawnOptions || {shell: true});

                    if (this.debug === true) {
                        ytdlpProcess.on('close', childProcessCloseEvent);
                    }

                    logger.log('OK');

                    resolve(ytdlpProcess);
                }, waitTime);
            }
        });
    };
    noStreamRun = function (this: fluentYTDlp, runOptions: NoStreamRunOptions = {type: 'execFile', callback: function () {}, force: false}): ChildProcess {
        //noStreamRun()
        const logger = new Log('NoStreamRun', this.debug),
            options = generateOption({debug: this.debug, wrongOption: this.wrongOption, options: this.options}, runOptions),
            ytdlpProcess = (() => {
                if (runOptions.type === 'exec') {
                    return exec([binaryPath.ytdlp, ...options].join(' '), runOptions.callback);
                } else {
                    return execFile(binaryPath.ytdlp, options, runOptions.callback);
                }
            })();

        if (!runOptions.type) {
            logger.warning('実行形式が指定されませんでした。');
        }
        if (!runOptions.callback) {
            logger.warning('コールバック関数が指定されませんでした。');
        }

        if (this.debug === true) {
            ytdlpProcess.on('close', childProcessCloseEvent);
        }

        logger.log('OK');

        return ytdlpProcess;
    };

    /* 簡易オプション */
    resolution = function (this: fluentYTDlp, resolution: string): fluentYTDlp {
        //resolution()
        const logger = new Log('Resolution', this.debug),
            [width, height] = resolution.split('x');

        //resolutionにxが含まれるかをチェックする
        if (!resolution.includes('x')) {
            logger.warning('[resolution]の引数が「横×縦」で指定されていない可能性があります。');
            this.wrongOption.push('resolution');
        }

        //型がstringかをチェックする
        if (typeof resolution !== 'string' || !resolution) {
            logger.warning('[resolution]の引数の型が「String」ではない可能性があります。');

            if (!this.wrongOption.includes('resolution')) {
                this.wrongOption.push('resolution');
            }
        }
        this.options.width = width;
        this.options.height = height;
        return this;
    };
    width = function (this: fluentYTDlp, _width: string | number): fluentYTDlp {
        //width()
        const logger = new Log('Width', this.debug),
            width = _width.toString();

        //_widthが数字か、型がstringまたはnumberかをチェックする
        if (isNaN(+width) || ['string', 'number'].includes(typeof _width)) {
            logger.warning('[width]に指定された値は数字ではないか、型が「String」または「Number」ではない可能性があります。');
            this.wrongOption.push('width');
        }

        this.options.width = width.toString();

        return this;
    };
    height = function (this: fluentYTDlp, _height: string | number): fluentYTDlp {
        //height()
        const logger = new Log('Height', this.debug),
            height = _height.toString();

        //_heightが数字か、型がstringまたはnumberかをチェックする
        if (isNaN(+height) || ['string', 'number'].includes(typeof _height) || !_height) {
            logger.warning('[height]に指定された値は数字ではないか、型が「String」または「Number」ではない可能性があります。');
            this.wrongOption.push('height');
        }

        this.options.height = height.toString();

        return this;
    };
    filename = function (this: fluentYTDlp, filename: string): fluentYTDlp {
        //filename()
        const logger = new Log('Filename', this.debug);

        //型がstringかをチェックする
        if (typeof filename !== 'string' || !filename) {
            logger.warning('[filename]に指定された値は型が「String」ではない可能性があります。');
            this.wrongOption.push('filename');
        }

        this.options.filename = filename;
        return this;
    };
    extension = function (this: fluentYTDlp, extension: string): fluentYTDlp {
        //extension()
        const logger = new Log('Extension', this.debug);

        //型がstringかをチェックする
        if (typeof extension !== 'string' || !extension) {
            logger.warning('[extension]に指定された値は型が「String」ではない可能性があります。');
            this.wrongOption.push('extension');
        }

        this.options.extension = extension;
        return this;
    };

    /* その他のオプション */
    url = function (this: fluentYTDlp, url: string): fluentYTDlp {
        //url()
        const logger = new Log('Url', this.debug);

        //型がstringかをチェックする
        if (typeof url !== 'string' || !url) {
            logger.warning('[url]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('url')) {
                this.wrongOption.push('url');
            }
        }
        this.options.url = url;

        return this;
    };
    otherOptions = function (this: fluentYTDlp, otherOptions: YTDlpOptionsData): fluentYTDlp {
        //otherOptions()
        const logger = new Log('OtherOptions', this.debug);

        //型がobjectかをチェックする
        if (typeof otherOptions !== 'object' || !otherOptions) {
            logger.warning('[otherOptions]の引数の型が「Object」ではない可能性があります。');
            this.wrongOption.push('otherOptions');
        }

        Object.entries(otherOptions).forEach(([key, param]) => {
            this.options[key] = param;
        });

        return this;
    };
    _ytdlpPath = function (): string {
        //_ytdlpPath()
        return binaryPath.ytdlp;
    };
    _ffmpegPath = function (): string {
        //_ffmpegPath()
        return binaryPath.ffmpeg;
    };
    _ffprobePath = function (): string {
        //_ffprobePath()
        return binaryPath.ffprobe;
    };
    _binPath = function (): string {
        //_binPath()
        return binaryPath.folder;
    };

    /* yt-dlpに関するオプション */
    help = function (this: fluentYTDlp): fluentYTDlp {
        //help()
        this.options.help = noParamText;
        return this;
    };
    version = function (this: fluentYTDlp): fluentYTDlp {
        //version()
        this.options.version = noParamText;
        return this;
    };
    update = function (this: fluentYTDlp): fluentYTDlp {
        //update()
        this.options.update = noParamText;
        return this;
    };
    noUpdate = function (this: fluentYTDlp): fluentYTDlp {
        //noUpdate()
        this.options.noUpdate = noParamText;
        return this;
    };
    updateTo = function (this: fluentYTDlp, version: string): fluentYTDlp {
        //updateTo()
        const logger = new Log('UpdateTo', this.debug);

        //型がstringかをチェックする
        if (typeof version !== 'string' || !version) {
            logger.warning('[updateTo]の引数の型が「String」ではない可能性があります。');
            this.wrongOption.push('updateTo');
        }

        this.options.updateTo = version;

        return this;
    };

    /* 一般オプション */
    ignoreErrors = function (this: fluentYTDlp): fluentYTDlp {
        //ignoreErrors()
        this.options.ignoreErrors = noParamText;
        return this;
    };
    abortOnError = function (this: fluentYTDlp): fluentYTDlp {
        //abortOnError()
        this.options.abortOnError = noParamText;
        return this;
    };
    noIgnoreErrors = function (this: fluentYTDlp): fluentYTDlp {
        //noIgnoreErrors()
        this.options.noIgnoreErrors = noParamText;
        return this;
    };
    noAbortOnError = function (this: fluentYTDlp): fluentYTDlp {
        //noAbortOnError()
        this.options.noAbortOnError = noParamText;
        return this;
    };
    dumpUserAgent = function (this: fluentYTDlp): fluentYTDlp {
        //dumpUserAgent()
        this.options.dumpUserAgent = noParamText;
        return this;
    };
    listExtractors = function (this: fluentYTDlp): fluentYTDlp {
        //listExtractors()
        this.options.listExtractors = noParamText;
        return this;
    };
    extractorDescriptions = function (this: fluentYTDlp): fluentYTDlp {
        //extractorDescriptions()
        this.options.extractorDescriptions = noParamText;
        return this;
    };
    useExtractors = function (this: fluentYTDlp, extractor: string): fluentYTDlp {
        //useExtractors()
        const logger = new Log('UseExtractors', this.debug);

        //型がstringかをチェックする
        if (typeof extractor !== 'string' || !extractor) {
            logger.warning('[useExtractors]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('useExtractors')) {
                this.wrongOption.push('useExtractors');
            }
        }
        this.options.useExtractors = extractor;

        return this;
    };
    defaultSearch = function (this: fluentYTDlp, method: string): fluentYTDlp {
        //defaultSearch()
        const logger = new Log('DefaultSearch', this.debug);

        //型がstringかをチェックする
        if (typeof method !== 'string' || !method) {
            logger.warning('[defaultSearch]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('defaultSearch')) {
                this.wrongOption.push('defaultSearch');
            }
        }
        this.options.defaultSearch = method;

        return this;
    };
    configLocation = function (this: fluentYTDlp, path: string): fluentYTDlp {
        //configLocation()
        const logger = new Log('ConfigLocation', this.debug);

        //型がstringかをチェックする
        if (typeof path !== 'string' || !path) {
            logger.warning('[configLocation]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('configLocation')) {
                this.wrongOption.push('configLocation');
            }
        }
        this.options.configLocation = path;

        return this;
    };
    ignoreConfig = function (this: fluentYTDlp): fluentYTDlp {
        //ignoreConfig()
        this.options.ignoreConfig = noParamText;
        return this;
    };
    noConfig = function (this: fluentYTDlp): fluentYTDlp {
        //noConfig()
        this.options.noConfig = noParamText;
        return this;
    };
    noConfigLocations = function (this: fluentYTDlp): fluentYTDlp {
        //noConfigLocations()
        this.options.noConfigLocations = noParamText;
        return this;
    };
    flatPlaylist = function (this: fluentYTDlp): fluentYTDlp {
        //flatPlaylist()
        this.options.flatPlaylist = noParamText;
        return this;
    };
    noFlatPlaylist = function (this: fluentYTDlp): fluentYTDlp {
        //noFlatPlaylist()
        this.options.noFlatPlaylist = noParamText;
        return this;
    };
    liveFromStart = function (this: fluentYTDlp): fluentYTDlp {
        //liveFromStart()
        const logger = new Log('LiveFromStart', this.debug);
        logger.warning('[liveFromStart]は実験的である可能性があります。（fluent-ytdlp v1.0.0公開時）');

        this.options.liveFromStart = noParamText;

        return this;
    };
    noLiveFromStart = function (this: fluentYTDlp): fluentYTDlp {
        //noLiveFromStart()
        this.options.noLiveFromStart = noParamText;
        return this;
    };
    waitForVideo = function (this: fluentYTDlp, seconds: string | number): fluentYTDlp {
        //waitForVideo()
        const logger = new Log('WaitForVideo', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof seconds) || !seconds) {
            logger.warning('[waitForVideo]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('waitForVideo')) {
                this.wrongOption.push('waitForVideo');
            }
        }
        this.options.waitForVideo = seconds.toString();

        return this;
    };
    noWaitForVideo = function (this: fluentYTDlp): fluentYTDlp {
        //noWaitForVideo()
        this.options.noWaitForVideo = noParamText;
        return this;
    };
    markWatched = function (this: fluentYTDlp): fluentYTDlp {
        //markWatched()
        this.options.markWatched = noParamText;
        return this;
    };
    noMarkWatched = function (this: fluentYTDlp): fluentYTDlp {
        //noMarkWatched()
        this.options.noMarkWatched = noParamText;
        return this;
    };
    noColors = function (this: fluentYTDlp): fluentYTDlp {
        //noColors()
        this.options.noColors = noParamText;
        return this;
    };
    compatOptions = function (this: fluentYTDlp, opts: string): fluentYTDlp {
        //compatOptions()
        const logger = new Log('CompatOptions', this.debug);

        //型がstringかをチェックする
        if (typeof opts !== 'string' || !opts) {
            logger.warning('[compatOptions]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('compatOptions')) {
                this.wrongOption.push('compatOptions');
            }
        }
        this.options.compatOptions = opts;

        return this;
    };

    /* ネットワークオプション */
    proxy = function (this: fluentYTDlp, proxyUrl: string): fluentYTDlp {
        //proxy()
        const logger = new Log('Proxy', this.debug);

        //型がstringかをチェックする
        if (typeof proxyUrl !== 'string' || !proxyUrl) {
            logger.warning('[proxy]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('proxy')) {
                this.wrongOption.push('proxy');
            }
        }
        this.options.proxy = proxyUrl;

        return this;
    };
    socketTimeout = function (this: fluentYTDlp, seconds: string | number): fluentYTDlp {
        //socketTimeout()
        const logger = new Log('SocketTimeout', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof seconds) || !seconds) {
            logger.warning('[socketTimeout]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('socketTimeout')) {
                this.wrongOption.push('socketTimeout');
            }
        }
        this.options.socketTimeout = seconds.toString();

        return this;
    };
    sourceAddress = function (this: fluentYTDlp, address: string): fluentYTDlp {
        //sourceAddress()
        const logger = new Log('SourceAddress', this.debug);

        //型がstringかをチェックする
        if (typeof address !== 'string' || !address) {
            logger.warning('[sourceAddress]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('sourceAddress')) {
                this.wrongOption.push('sourceAddress');
            }
        }
        this.options.sourceAddress = address;

        return this;
    };
    forceIpv4 = function (this: fluentYTDlp): fluentYTDlp {
        //forceIpv4()
        this.options.forceIpv4 = noParamText;
        return this;
    };
    forceIpv6 = function (this: fluentYTDlp): fluentYTDlp {
        //forceIpv6()
        this.options.forceIpv6 = noParamText;
        return this;
    };
    enableFileUrls = function (this: fluentYTDlp): fluentYTDlp {
        //enableFileUrls()
        this.options.enableFileUrls = noParamText;
        return this;
    };
    geoVerificationProxy = function (this: fluentYTDlp, proxyUrl: string): fluentYTDlp {
        //geoVerificationProxy()
        const logger = new Log('GeoVerificationProxy', this.debug);

        //型がstringかをチェックする
        if (typeof proxyUrl !== 'string' || !proxyUrl) {
            logger.warning('[geoVerificationProxy]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('geoVerificationProxy')) {
                this.wrongOption.push('geoVerificationProxy');
            }
        }
        this.options.geoVerificationProxy = proxyUrl;

        return this;
    };
    geoBypass = function (this: fluentYTDlp): fluentYTDlp {
        //geoBypass()
        this.options.geoBypass = noParamText;
        return this;
    };
    noGeoBypass = function (this: fluentYTDlp): fluentYTDlp {
        //noGeoBypass()
        this.options.noGeoBypass = noParamText;
        return this;
    };
    geoBypassCountry = function (this: fluentYTDlp, countryCode: string): fluentYTDlp {
        //geoBypassCountry()
        const logger = new Log('GeoBypassCountry', this.debug);

        //型がstringかをチェックする
        if (typeof countryCode !== 'string' || !countryCode) {
            logger.warning('[geoBypassCountry]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('geoBypassCountry')) {
                this.wrongOption.push('geoBypassCountry');
            }
        }
        this.options.geoBypassCountry = countryCode;

        return this;
    };
    geoBypassIpBlock = function (this: fluentYTDlp, ipBlock: string): fluentYTDlp {
        //geoBypassIpBlock()
        const logger = new Log('GeoBypassIpBlock', this.debug);

        //型がstringかをチェックする
        if (typeof ipBlock !== 'string' || !ipBlock) {
            logger.warning('[geoBypassIpBlock]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('geoBypassIpBlock')) {
                this.wrongOption.push('geoBypassIpBlock');
            }
        }
        this.options.geoBypassIpBlock = ipBlock;

        return this;
    };

    /* 動画選択オプション */
    playlistItems = function (this: fluentYTDlp, index: string): fluentYTDlp {
        //playlistItems()
        const logger = new Log('PlaylistItems', this.debug);

        //型がstringかをチェックする
        if (typeof index !== 'string' || !index) {
            logger.warning('[playlistItems]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('playlistItems')) {
                this.wrongOption.push('playlistItems');
            }
        }
        this.options.playlistItems = index;

        return this;
    };
    maxDownloads = function (this: fluentYTDlp, max: string | number): fluentYTDlp {
        //maxDownloads()
        const logger = new Log('MaxDownloads', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof max) || !max) {
            logger.warning('[maxDownloads]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('maxDownloads')) {
                this.wrongOption.push('maxDownloads');
            }
        }
        this.options.maxDownloads = max.toString();

        return this;
    };
    minFileSize = function (this: fluentYTDlp, size: string): fluentYTDlp {
        //minFileSize()
        const logger = new Log('MinFileSize', this.debug);

        //型がstringかをチェックする
        if (typeof size !== 'string' || !size) {
            logger.warning('[minFileSize]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('minFileSize')) {
                this.wrongOption.push('minFileSize');
            }
        }
        this.options.minFileSize = size;

        return this;
    };
    maxFileSize = function (this: fluentYTDlp, size: string): fluentYTDlp {
        //maxFileSize()
        const logger = new Log('MaxFileSize', this.debug);

        //型がstringかをチェックする
        if (typeof size !== 'string' || !size) {
            logger.warning('[maxFileSize]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('maxFileSize')) {
                this.wrongOption.push('maxFileSize');
            }
        }
        this.options.maxFileSize = size;

        return this;
    };
    date = function (this: fluentYTDlp, _date: string | Date): fluentYTDlp {
        //date()
        const logger = new Log('Date', this.debug),
            date = typeof _date === 'object' ? createDate(_date) : _date;

        //型がstringかをチェックする
        if (!['string', 'object'].includes(typeof date) || !date) {
            logger.warning('[date]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('date')) {
                this.wrongOption.push('date');
            }
        }
        this.options.date = date;

        return this;
    };
    dateBefore = function (this: fluentYTDlp, _date: string | Date): fluentYTDlp {
        //dateBefore()
        const logger = new Log('DateBefore', this.debug),
            date = typeof _date === 'object' ? createDate(_date) : _date;

        //型がstringかをチェックする
        if (!['string', 'object'].includes(typeof date) || !date) {
            logger.warning('[dateBefore]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('dateBefore')) {
                this.wrongOption.push('dateBefore');
            }
        }
        this.options.dateBefore = date;

        return this;
    };
    dateAfter = function (this: fluentYTDlp, _date: string | Date): fluentYTDlp {
        //dateAfter()
        const logger = new Log('DateAfter', this.debug),
            date = typeof _date === 'object' ? createDate(_date) : _date;

        //型がstringかをチェックする
        if (!['string', 'object'].includes(typeof date) || !date) {
            logger.warning('[dateAfter]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('dateAfter')) {
                this.wrongOption.push('dateAfter');
            }
        }
        this.options.dateAfter = date;

        return this;
    };
    matchFilters = function (this: fluentYTDlp, filter: string): fluentYTDlp {
        //matchFilters()
        const logger = new Log('MatchFilters', this.debug);

        //型がstringかをチェックする
        if (typeof filter !== 'string' || !filter) {
            logger.warning('[matchFilters]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('matchFilters')) {
                this.wrongOption.push('matchFilters');
            }
        }
        this.options.matchFilters = filter;

        return this;
    };
    noMatchFilter = function (this: fluentYTDlp): fluentYTDlp {
        //noMatchFilter()
        this.options.noMatchFilter = noParamText;
        return this;
    };
    breakMatchFilters = function (this: fluentYTDlp, filter: string): fluentYTDlp {
        //breakMatchFilters()
        const logger = new Log('BreakMatchFilters', this.debug);

        //型がstringかをチェックする
        if (typeof filter !== 'string' || !filter) {
            logger.warning('[breakMatchFilters]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('breakMatchFilters')) {
                this.wrongOption.push('breakMatchFilters');
            }
        }
        this.options.breakMatchFilters = filter;

        return this;
    };
    noBreakMatchFilters = function (this: fluentYTDlp): fluentYTDlp {
        //noBreakMatchFilters()
        this.options.noBreakMatchFilters = noParamText;
        return this;
    };
    noPlaylist = function (this: fluentYTDlp): fluentYTDlp {
        //noPlaylist()
        this.options.noPlaylist = noParamText;
        return this;
    };
    yesPlaylist = function (this: fluentYTDlp): fluentYTDlp {
        //yesPlaylist()
        this.options.yesPlaylist = noParamText;
        return this;
    };
    ageLimit = function (this: fluentYTDlp, years: string | number): fluentYTDlp {
        //ageLimit()
        const logger = new Log('AgeLimit', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof years) || !years) {
            logger.warning('[ageLimit]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('ageLimit')) {
                this.wrongOption.push('ageLimit');
            }
        }
        this.options.ageLimit = years.toString();

        return this;
    };
    downloadArchive = function (this: fluentYTDlp, file: string): fluentYTDlp {
        //downloadArchive()
        const logger = new Log('DownloadArchive', this.debug);

        //型がstringかをチェックする
        if (typeof file !== 'string' || !file) {
            logger.warning('[downloadArchive]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('downloadArchive')) {
                this.wrongOption.push('downloadArchive');
            }
        }
        this.options.downloadArchive = file;

        return this;
    };
    noDownloadArchive = function (this: fluentYTDlp): fluentYTDlp {
        //noDownloadArchive()
        this.options.noDownloadArchive = noParamText;
        return this;
    };
    breakOnExisting = function (this: fluentYTDlp): fluentYTDlp {
        //breakOnExisting()
        this.options.breakOnExisting = noParamText;
        return this;
    };
    breakPerInput = function (this: fluentYTDlp): fluentYTDlp {
        //breakPerInput()
        this.options.breakPerInput = noParamText;
        return this;
    };
    noBreakPerInput = function (this: fluentYTDlp): fluentYTDlp {
        //noBreakPerInput()
        this.options.noBreakPerInput = noParamText;
        return this;
    };
    skipPlaylistAfterErrors = function (this: fluentYTDlp, limit: string | number): fluentYTDlp {
        //skipPlaylistAfterErrors()
        const logger = new Log('SkipPlaylistAfterErrors', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof limit) || !limit) {
            logger.warning('[skipPlaylistAfterErrors]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('skipPlaylistAfterErrors')) {
                this.wrongOption.push('skipPlaylistAfterErrors');
            }
        }
        this.options.skipPlaylistAfterErrors = limit.toString();

        return this;
    };

    /* ダウンロードオプション */
    concurrentFragments = function (this: fluentYTDlp, number: string | number): fluentYTDlp {
        //concurrentFragments()
        const logger = new Log('ConcurrentFragments', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof number) || !number) {
            logger.warning('[concurrentFragments]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('concurrentFragments')) {
                this.wrongOption.push('concurrentFragments');
            }
        }
        this.options.concurrentFragments = number.toString();

        return this;
    };
    limitRate = function (this: fluentYTDlp, rate: string): fluentYTDlp {
        //limitRate()
        const logger = new Log('LimitRate', this.debug);

        //型がstringかをチェックする
        if (typeof rate !== 'string' || !rate) {
            logger.warning('[limitRate]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('limitRate')) {
                this.wrongOption.push('limitRate');
            }
        }
        this.options.limitRate = rate;

        return this;
    };
    throttledRate = function (this: fluentYTDlp, rate: string): fluentYTDlp {
        //throttledRate()
        const logger = new Log('ThrottledRate', this.debug);

        //型がstringかをチェックする
        if (typeof rate !== 'string' || !rate) {
            logger.warning('[throttledRate]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('throttledRate')) {
                this.wrongOption.push('throttledRate');
            }
        }
        this.options.throttledRate = rate;

        return this;
    };
    retries = function (this: fluentYTDlp, retries: string | number): fluentYTDlp {
        //retries()
        const logger = new Log('Retries', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof retries) || !retries) {
            logger.warning('[retries]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('retries')) {
                this.wrongOption.push('retries');
            }
        }
        this.options.retries = retries.toString();

        return this;
    };
    fileAccessRetries = function (this: fluentYTDlp, retries: string | number): fluentYTDlp {
        //fileAccessRetries()
        const logger = new Log('FileAccessRetries', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof retries) || !retries) {
            logger.warning('[fileAccessRetries]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('fileAccessRetries')) {
                this.wrongOption.push('fileAccessRetries');
            }
        }
        this.options.fileAccessRetries = retries.toString();

        return this;
    };
    fragmentRetries = function (this: fluentYTDlp, retries: string | number): fluentYTDlp {
        //fragmentRetries()
        const logger = new Log('FragmentRetries', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof retries) || !retries) {
            logger.warning('[fragmentRetries]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('fragmentRetries')) {
                this.wrongOption.push('fragmentRetries');
            }
        }
        this.options.fragmentRetries = retries.toString();

        return this;
    };
    retrySleep = function (this: fluentYTDlp, seconds: string | number): fluentYTDlp {
        //retrySleep()
        const logger = new Log('RetrySleep', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof seconds) || !seconds) {
            logger.warning('[retrySleep]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('retrySleep')) {
                this.wrongOption.push('retrySleep');
            }
        }
        this.options.retrySleep = seconds.toString();

        return this;
    };
    noAbortOnUnavailableFragments = function (this: fluentYTDlp): fluentYTDlp {
        //noAbortOnUnavailableFragments()
        this.options.noAbortOnUnavailableFragments = noParamText;
        return this;
    };
    skipUnavailableFragments = function (this: fluentYTDlp): fluentYTDlp {
        //skipUnavailableFragments()
        this.options.skipUnavailableFragments = noParamText;
        return this;
    };
    abortOnUnavailableFragments = function (this: fluentYTDlp): fluentYTDlp {
        //abortOnUnavailableFragments()
        this.options.abortOnUnavailableFragments = noParamText;
        return this;
    };
    noSkipUnavailableFragments = function (this: fluentYTDlp): fluentYTDlp {
        //noSkipUnavailableFragments()
        this.options.noSkipUnavailableFragments = noParamText;
        return this;
    };
    keepFragments = function (this: fluentYTDlp): fluentYTDlp {
        //keepFragments()
        this.options.keepFragments = noParamText;
        return this;
    };
    noKeepFragments = function (this: fluentYTDlp): fluentYTDlp {
        //noKeepFragments()
        this.options.noKeepFragments = noParamText;
        return this;
    };
    bufferSize = function (this: fluentYTDlp, size: string): fluentYTDlp {
        //bufferSize()
        const logger = new Log('BufferSize', this.debug);

        //型がstringかをチェックする
        if (typeof size !== 'string' || !size) {
            logger.warning('[bufferSize]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('bufferSize')) {
                this.wrongOption.push('bufferSize');
            }
        }
        this.options.bufferSize = size;

        return this;
    };
    resizeBuffer = function (this: fluentYTDlp): fluentYTDlp {
        //resizeBuffer()
        this.options.resizeBuffer = noParamText;
        return this;
    };
    noResizeBuffer = function (this: fluentYTDlp): fluentYTDlp {
        //noResizeBuffer()
        this.options.noResizeBuffer = noParamText;
        return this;
    };
    httpChunkSize = function (this: fluentYTDlp, size: string): fluentYTDlp {
        //httpChunkSize()
        const logger = new Log('HttpChunkSize', this.debug);
        logger.warning('[httpChunkSize]は実験的である可能性があります。（fluent-ytdlp v1.0.0公開時）');

        //型がstringかをチェックする
        if (typeof size !== 'string' || !size) {
            logger.warning('[httpChunkSize]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('httpChunkSize')) {
                this.wrongOption.push('httpChunkSize');
            }
        }
        this.options.httpChunkSize = size;

        return this;
    };
    playlistRandom = function (this: fluentYTDlp): fluentYTDlp {
        //playlistRandom()
        this.options.playlistRandom = noParamText;
        return this;
    };
    lazyPlaylist = function (this: fluentYTDlp): fluentYTDlp {
        //lazyPlaylist()
        this.options.lazyPlaylist = noParamText;
        return this;
    };
    noLazyPlaylist = function (this: fluentYTDlp): fluentYTDlp {
        //noLazyPlaylist()
        this.options.noLazyPlaylist = noParamText;
        return this;
    };
    xattrSetFileSize = function (this: fluentYTDlp): fluentYTDlp {
        //xattrSetFileSize()
        this.options.xattrSetFileSize = noParamText;
        return this;
    };
    hlsUseMpegts = function (this: fluentYTDlp): fluentYTDlp {
        //hlsUseMpegts()
        this.options.hlsUseMpegts = noParamText;
        return this;
    };
    noHlsUseMpegts = function (this: fluentYTDlp): fluentYTDlp {
        //noHlsUseMpegts()
        this.options.noHlsUseMpegts = noParamText;
        return this;
    };
    downloadSections = function (this: fluentYTDlp, regex: string): fluentYTDlp {
        //downloadSections()
        const logger = new Log('DownloadSections', this.debug);

        //型がstringかをチェックする
        if (typeof regex !== 'string' || !regex) {
            logger.warning('[downloadSections]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('downloadSections')) {
                this.wrongOption.push('downloadSections');
            }
        }
        this.options.downloadSections = regex;

        return this;
    };
    downloader = function (this: fluentYTDlp, downloader: string): fluentYTDlp {
        //downloader()
        const logger = new Log('Downloader', this.debug);

        //型がstringかをチェックする
        if (typeof downloader !== 'string' || !downloader) {
            logger.warning('[downloader]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('downloader')) {
                this.wrongOption.push('downloader');
            }
        }
        this.options.downloader = downloader;

        return this;
    };
    externalDownloader = function (this: fluentYTDlp, downloader: string): fluentYTDlp {
        //externalDownloader()
        const logger = new Log('ExternalDownloader', this.debug);

        //型がstringかをチェックする
        if (typeof downloader !== 'string' || !downloader) {
            logger.warning('[externalDownloader]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('externalDownloader')) {
                this.wrongOption.push('externalDownloader');
            }
        }
        this.options.externalDownloader = downloader;

        return this;
    };
    downloaderArgs = function (this: fluentYTDlp, args: string): fluentYTDlp {
        //downloaderArgs()
        const logger = new Log('DownloaderArgs', this.debug);

        //型がstringかをチェックする
        if (typeof args !== 'string' || !args) {
            logger.warning('[downloaderArgs]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('downloaderArgs')) {
                this.wrongOption.push('downloaderArgs');
            }
        }
        this.options.downloaderArgs = args;

        return this;
    };
    externalDownloaderArgs = function (this: fluentYTDlp, args: string): fluentYTDlp {
        //externalDownloaderArgs()
        const logger = new Log('ExternalDownloaderArgs', this.debug);

        //型がstringかをチェックする
        if (typeof args !== 'string' || !args) {
            logger.warning('[externalDownloaderArgs]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('externalDownloaderArgs')) {
                this.wrongOption.push('externalDownloaderArgs');
            }
        }
        this.options.externalDownloaderArgs = args;

        return this;
    };

    /* ファイルシステムオプション */
    batchFile = function (this: fluentYTDlp, file: string): fluentYTDlp {
        //batchFile()
        const logger = new Log('BatchFile', this.debug);

        //型がstringかをチェックする
        if (typeof file !== 'string' || !file) {
            logger.warning('[batchFile]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('batchFile')) {
                this.wrongOption.push('batchFile');
            }
        }
        this.options.batchFile = file;

        return this;
    };
    noBatchFile = function (this: fluentYTDlp): fluentYTDlp {
        //noBatchFile()
        this.options.noBatchFile = noParamText;
        return this;
    };
    paths = function (this: fluentYTDlp, path: string): fluentYTDlp {
        //paths()
        const logger = new Log('Paths', this.debug);

        //型がstringかをチェックする
        if (typeof path !== 'string' || !path) {
            logger.warning('[paths]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('paths')) {
                this.wrongOption.push('paths');
            }
        }
        this.options.paths = path;

        return this;
    };
    output = function (this: fluentYTDlp, template: string): fluentYTDlp {
        //output()
        const logger = new Log('Output', this.debug);

        //型がstringかをチェックする
        if (typeof template !== 'string' || !template) {
            logger.warning('[output]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('output')) {
                this.wrongOption.push('output');
            }
        }
        this.options.output = template;

        return this;
    };
    outputNaPlaceholder = function (this: fluentYTDlp, text: string): fluentYTDlp {
        //outputNaPlaceholder()
        const logger = new Log('OutputNaPlaceholder', this.debug);

        //型がstringかをチェックする
        if (typeof text !== 'string' || !text) {
            logger.warning('[outputNaPlaceholder]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('outputNaPlaceholder')) {
                this.wrongOption.push('outputNaPlaceholder');
            }
        }
        this.options.outputNaPlaceholder = text;

        return this;
    };
    restrictFilenames = function (this: fluentYTDlp): fluentYTDlp {
        //restrictFilenames()
        this.options.restrictFilenames = noParamText;
        return this;
    };
    noRestrictFilenames = function (this: fluentYTDlp): fluentYTDlp {
        //noRestrictFilenames()
        this.options.noRestrictFilenames = noParamText;
        return this;
    };
    windowsFilenames = function (this: fluentYTDlp): fluentYTDlp {
        //windowsFilenames()
        this.options.windowsFilenames = noParamText;
        return this;
    };
    noWindowsFilenames = function (this: fluentYTDlp): fluentYTDlp {
        //noWindowsFilenames()
        this.options.noWindowsFilenames = noParamText;
        return this;
    };
    trimFilenames = function (this: fluentYTDlp, length: string | number): fluentYTDlp {
        //trimFilenames()
        const logger = new Log('TrimFilenames', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof length) || !length) {
            logger.warning('[trimFilenames]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('trimFilenames')) {
                this.wrongOption.push('trimFilenames');
            }
        }
        this.options.trimFilenames = length.toString();

        return this;
    };
    noOverwrites = function (this: fluentYTDlp): fluentYTDlp {
        //noOverwrites()
        this.options.noOverwrites = noParamText;
        return this;
    };
    forceOverwrites = function (this: fluentYTDlp): fluentYTDlp {
        //forceOverwrites()
        this.options.forceOverwrites = noParamText;
        return this;
    };
    noForceOverwrites = function (this: fluentYTDlp): fluentYTDlp {
        //noForceOverwrites()
        this.options.noForceOverwrites = noParamText;
        return this;
    };
    continue = function (this: fluentYTDlp): fluentYTDlp {
        //continue()
        this.options.continue = noParamText;
        return this;
    };
    noContinue = function (this: fluentYTDlp): fluentYTDlp {
        //noContinue()
        this.options.noContinue = noParamText;
        return this;
    };
    part = function (this: fluentYTDlp): fluentYTDlp {
        //part()
        this.options.part = noParamText;
        return this;
    };
    noPart = function (this: fluentYTDlp): fluentYTDlp {
        //noPart()
        this.options.noPart = noParamText;
        return this;
    };
    mtime = function (this: fluentYTDlp): fluentYTDlp {
        //mtime()
        this.options.mtime = noParamText;
        return this;
    };
    noMtime = function (this: fluentYTDlp): fluentYTDlp {
        //noMtime()
        this.options.noMtime = noParamText;
        return this;
    };
    writeDescription = function (this: fluentYTDlp): fluentYTDlp {
        //writeDescription()
        this.options.writeDescription = noParamText;
        return this;
    };
    noWriteDescription = function (this: fluentYTDlp): fluentYTDlp {
        //noWriteDescription()
        this.options.noWriteDescription = noParamText;
        return this;
    };
    writeInfoJson = function (this: fluentYTDlp): fluentYTDlp {
        //writeInfoJson()
        this.options.writeInfoJson = noParamText;
        return this;
    };
    noWriteInfoJson = function (this: fluentYTDlp): fluentYTDlp {
        //noWriteInfoJson()
        this.options.noWriteInfoJson = noParamText;
        return this;
    };
    cleanInfoJson = function (this: fluentYTDlp): fluentYTDlp {
        //cleanInfoJson()
        this.options.cleanInfoJson = noParamText;
        return this;
    };
    noCleanInfoJson = function (this: fluentYTDlp): fluentYTDlp {
        //noCleanInfoJson()
        this.options.noCleanInfoJson = noParamText;
        return this;
    };
    writePlaylistMetafiles = function (this: fluentYTDlp): fluentYTDlp {
        //writePlaylistMetafiles()
        this.options.writePlaylistMetafiles = noParamText;
        return this;
    };
    noWritePlaylistMetafiles = function (this: fluentYTDlp): fluentYTDlp {
        //noWritePlaylistMetafiles()
        this.options.noWritePlaylistMetafiles = noParamText;
        return this;
    };
    writeComments = function (this: fluentYTDlp): fluentYTDlp {
        //writeComments()
        this.options.writeComments = noParamText;
        return this;
    };
    getComments = function (this: fluentYTDlp): fluentYTDlp {
        //getComments()
        this.options.getComments = noParamText;
        return this;
    };
    noWriteComments = function (this: fluentYTDlp): fluentYTDlp {
        //noWriteComments()
        this.options.noWriteComments = noParamText;
        return this;
    };
    noGetComments = function (this: fluentYTDlp): fluentYTDlp {
        //noGetComments()
        this.options.noGetComments = noParamText;
        return this;
    };
    loadInfoJson = function (this: fluentYTDlp, file: string): fluentYTDlp {
        //loadInfoJson()
        const logger = new Log('LoadInfoJson', this.debug);

        //型がstringかをチェックする
        if (typeof file !== 'string' || !file) {
            logger.warning('[loadInfoJson]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('loadInfoJson')) {
                this.wrongOption.push('loadInfoJson');
            }
        }
        this.options.loadInfoJson = file;

        return this;
    };
    cookies = function (this: fluentYTDlp, file: string): fluentYTDlp {
        //cookies()
        const logger = new Log('Cookies', this.debug);

        //型がstringかをチェックする
        if (typeof file !== 'string' || !file) {
            logger.warning('[cookies]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('cookies')) {
                this.wrongOption.push('cookies');
            }
        }
        this.options.cookies = file;

        return this;
    };
    noCookies = function (this: fluentYTDlp): fluentYTDlp {
        //noCookies()
        this.options.noCookies = noParamText;
        return this;
    };
    cookiesFromBrowser = function (this: fluentYTDlp, browser: string): fluentYTDlp {
        //cookiesFromBrowser()
        const logger = new Log('CookiesFromBrowser', this.debug);

        //型がstringかをチェックする
        if (typeof browser !== 'string' || !browser) {
            logger.warning('[cookiesFromBrowser]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('cookiesFromBrowser')) {
                this.wrongOption.push('cookiesFromBrowser');
            }
        }
        this.options.cookiesFromBrowser = browser;

        return this;
    };
    noCookiesFromBrowser = function (this: fluentYTDlp): fluentYTDlp {
        //noCookiesFromBrowser()
        this.options.noCookiesFromBrowser = noParamText;
        return this;
    };
    cacheDir = function (this: fluentYTDlp, dir: string): fluentYTDlp {
        //cacheDir()
        const logger = new Log('CacheDir', this.debug);

        //型がstringかをチェックする
        if (typeof dir !== 'string' || !dir) {
            logger.warning('[cacheDir]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('cacheDir')) {
                this.wrongOption.push('cacheDir');
            }
        }
        this.options.cacheDir = dir;

        return this;
    };
    noCacheDir = function (this: fluentYTDlp): fluentYTDlp {
        //noCacheDir()
        this.options.noCacheDir = noParamText;
        return this;
    };
    rmCacheDir = function (this: fluentYTDlp): fluentYTDlp {
        //rmCacheDir()
        this.options.rmCacheDir = noParamText;
        return this;
    };

    /* サムネイルオプション */
    writeThumbnail = function (this: fluentYTDlp): fluentYTDlp {
        //writeThumbnail()
        this.options.writeThumbnail = noParamText;
        return this;
    };
    writeAllThumbnails = function (this: fluentYTDlp): fluentYTDlp {
        //writeAllThumbnails()
        this.options.writeAllThumbnails = noParamText;
        return this;
    };
    noWriteThumbnail = function (this: fluentYTDlp): fluentYTDlp {
        //noWriteThumbnail()
        this.options.noWriteThumbnail = noParamText;
        return this;
    };
    listThumbnails = function (this: fluentYTDlp): fluentYTDlp {
        //listThumbnails()
        this.options.listThumbnails = noParamText;
        return this;
    };

    /* インターネットショートカットオプション */
    writeLink = function (this: fluentYTDlp): fluentYTDlp {
        //writeLink()
        this.options.writeLink = noParamText;
        return this;
    };
    writeUrlLink = function (this: fluentYTDlp): fluentYTDlp {
        //writeUrlLink()
        this.options.writeUrlLink = noParamText;
        return this;
    };
    writeWeblocLink = function (this: fluentYTDlp): fluentYTDlp {
        //writeWeblocLink()
        this.options.writeWeblocLink = noParamText;
        return this;
    };
    writeDesktopLink = function (this: fluentYTDlp): fluentYTDlp {
        //writeDesktopLink()
        this.options.writeDesktopLink = noParamText;
        return this;
    };

    /* 冗長性・シュミレートオプション */
    quiet = function (this: fluentYTDlp): fluentYTDlp {
        //quiet()
        this.options.quiet = noParamText;
        return this;
    };
    noWarnings = function (this: fluentYTDlp): fluentYTDlp {
        //noWarnings()
        this.options.noWarnings = noParamText;
        return this;
    };
    simulate = function (this: fluentYTDlp): fluentYTDlp {
        //simulate()
        this.options.simulate = noParamText;
        return this;
    };
    noSimulate = function (this: fluentYTDlp): fluentYTDlp {
        //noSimulate()
        this.options.noSimulate = noParamText;
        return this;
    };
    ignoreNoFormatsError = function (this: fluentYTDlp): fluentYTDlp {
        //ignoreNoFormatsError()
        this.options.ignoreNoFormatsError = noParamText;
        return this;
    };
    noIgnoreNoFormatsError = function (this: fluentYTDlp): fluentYTDlp {
        //noIgnoreNoFormatsError()
        this.options.noIgnoreNoFormatsError = noParamText;
        return this;
    };
    skipDownload = function (this: fluentYTDlp): fluentYTDlp {
        //skipDownload()
        this.options.skipDownload = noParamText;
        return this;
    };
    noDownload = function (this: fluentYTDlp): fluentYTDlp {
        //noDownload()
        this.options.noDownload = noParamText;
        return this;
    };
    print = function (this: fluentYTDlp, template: string): fluentYTDlp {
        //print()
        const logger = new Log('Print', this.debug);

        //型がstringかをチェックする
        if (typeof template !== 'string' || !template) {
            logger.warning('[print]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('print')) {
                this.wrongOption.push('print');
            }
        }
        this.options.print = template;

        return this;
    };
    printToFile = function (this: fluentYTDlp, templateFile: string): fluentYTDlp {
        //printToFile()
        const logger = new Log('PrintToFile', this.debug);

        //型がstringかをチェックする
        if (typeof templateFile !== 'string' || !templateFile) {
            logger.warning('[printToFile]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('printToFile')) {
                this.wrongOption.push('printToFile');
            }
        }
        this.options.printToFile = templateFile;

        return this;
    };
    dumpJson = function (this: fluentYTDlp): fluentYTDlp {
        //dumpJson()
        this.options.dumpJson = noParamText;
        return this;
    };
    dumpSingleJson = function (this: fluentYTDlp): fluentYTDlp {
        //dumpSingleJson()
        this.options.dumpSingleJson = noParamText;
        return this;
    };
    forceWriteArchive = function (this: fluentYTDlp): fluentYTDlp {
        //forceWriteArchive()
        this.options.forceWriteArchive = noParamText;
        return this;
    };
    forceDownloadArchive = function (this: fluentYTDlp): fluentYTDlp {
        //forceDownloadArchive()
        this.options.forceDownloadArchive = noParamText;
        return this;
    };
    newline = function (this: fluentYTDlp): fluentYTDlp {
        //newline()
        this.options.newline = noParamText;
        return this;
    };
    noProgress = function (this: fluentYTDlp): fluentYTDlp {
        //noProgress()
        this.options.noProgress = noParamText;
        return this;
    };
    progress = function (this: fluentYTDlp): fluentYTDlp {
        //progress()
        this.options.progress = noParamText;
        return this;
    };
    consoleTitle = function (this: fluentYTDlp): fluentYTDlp {
        //consoleTitle()
        this.options.consoleTitle = noParamText;
        return this;
    };
    progressTemplate = function (this: fluentYTDlp, template: string): fluentYTDlp {
        //progressTemplate()
        const logger = new Log('ProgressTemplate', this.debug);

        //型がstringかをチェックする
        if (typeof template !== 'string' || !template) {
            logger.warning('[progressTemplate]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('progressTemplate')) {
                this.wrongOption.push('progressTemplate');
            }
        }
        this.options.progressTemplate = template;

        return this;
    };
    verbose = function (this: fluentYTDlp): fluentYTDlp {
        //verbose()
        this.options.verbose = noParamText;
        return this;
    };
    dumpPages = function (this: fluentYTDlp): fluentYTDlp {
        //dumpPages()
        this.options.dumpPages = noParamText;
        return this;
    };
    writePages = function (this: fluentYTDlp): fluentYTDlp {
        //writePages()
        this.options.writePages = noParamText;
        return this;
    };
    printTraffic = function (this: fluentYTDlp): fluentYTDlp {
        //printTraffic()
        this.options.printTraffic = noParamText;
        return this;
    };

    /* 回避オプション */
    encoding = function (this: fluentYTDlp, encoding: string): fluentYTDlp {
        //encoding()
        const logger = new Log('Encoding', this.debug);
        logger.warning('[encoding]は実験的である可能性があります。（fluent-ytdlp v1.0.0公開時）');

        //型がstringかをチェックする
        if (typeof encoding !== 'string' || !encoding) {
            logger.warning('[encoding]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('encoding')) {
                this.wrongOption.push('encoding');
            }
        }
        this.options.encoding = encoding;

        return this;
    };
    legacyServerConnect = function (this: fluentYTDlp): fluentYTDlp {
        //legacyServerConnect()
        this.options.legacyServerConnect = noParamText;
        return this;
    };
    noCheckCertificates = function (this: fluentYTDlp): fluentYTDlp {
        //noCheckCertificates()
        this.options.noCheckCertificates = noParamText;
        return this;
    };
    preferInsecure = function (this: fluentYTDlp): fluentYTDlp {
        //preferInsecure()
        this.options.preferInsecure = noParamText;
        return this;
    };
    addHeaders = function (this: fluentYTDlp, headers: string): fluentYTDlp {
        //addHeaders()
        const logger = new Log('AddHeaders', this.debug);

        //型がstringかをチェックする
        if (typeof headers !== 'string' || !headers) {
            logger.warning('[addHeaders]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('addHeaders')) {
                this.wrongOption.push('addHeaders');
            }
        }
        this.options.addHeaders = headers;

        return this;
    };
    bidiWorkaround = function (this: fluentYTDlp): fluentYTDlp {
        //bidiWorkaround()
        this.options.bidiWorkaround = noParamText;
        return this;
    };
    sleepRequests = function (this: fluentYTDlp, seconds: string | number): fluentYTDlp {
        //sleepRequests()
        const logger = new Log('SleepRequests', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof seconds) || !seconds) {
            logger.warning('[sleepRequests]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('sleepRequests')) {
                this.wrongOption.push('sleepRequests');
            }
        }
        this.options.sleepRequests = seconds.toString();

        return this;
    };
    sleepInterval = function (this: fluentYTDlp, interval: string | number): fluentYTDlp {
        //sleepInterval()
        const logger = new Log('SleepInterval', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof interval) || !interval) {
            logger.warning('[sleepInterval]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('sleepInterval')) {
                this.wrongOption.push('sleepInterval');
            }
        }
        this.options.sleepInterval = interval.toString();

        return this;
    };
    minSleepInterval = function (this: fluentYTDlp, interval: string | number): fluentYTDlp {
        //minSleepInterval()
        const logger = new Log('MinSleepInterval', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof interval) || !interval) {
            logger.warning('[minSleepInterval]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('minSleepInterval')) {
                this.wrongOption.push('minSleepInterval');
            }
        }
        this.options.minSleepInterval = interval.toString();

        return this;
    };
    maxSleepInterval = function (this: fluentYTDlp, interval: string | number): fluentYTDlp {
        //maxSleepInterval()
        const logger = new Log('MaxSleepInterval', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof interval) || !interval) {
            logger.warning('[maxSleepInterval]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('maxSleepInterval')) {
                this.wrongOption.push('maxSleepInterval');
            }
        }
        this.options.maxSleepInterval = interval.toString();

        return this;
    };
    sleepSubtitles = function (this: fluentYTDlp, interval: string | number): fluentYTDlp {
        //sleepSubtitles()
        const logger = new Log('SleepSubtitles', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof interval) || !interval) {
            logger.warning('[sleepSubtitles]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('sleepSubtitles')) {
                this.wrongOption.push('sleepSubtitles');
            }
        }
        this.options.sleepSubtitles = interval.toString();

        return this;
    };

    /* 動画フォーマットオプション */
    format = function (this: fluentYTDlp, format: string): fluentYTDlp {
        //format()
        const logger = new Log('Format', this.debug);

        //型がstringかをチェックする
        if (typeof format !== 'string' || !format) {
            logger.warning('[format]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('format')) {
                this.wrongOption.push('format');
            }
        }
        this.options.format = format;

        return this;
    };
    formatSort = function (this: fluentYTDlp, sort: string): fluentYTDlp {
        //formatSort()
        const logger = new Log('FormatSort', this.debug);

        //型がstringかをチェックする
        if (typeof sort !== 'string' || !sort) {
            logger.warning('[formatSort]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('formatSort')) {
                this.wrongOption.push('formatSort');
            }
        }
        this.options.formatSort = sort;

        return this;
    };
    formatSortForce = function (this: fluentYTDlp): fluentYTDlp {
        //formatSortForce()
        this.options.formatSortForce = noParamText;
        return this;
    };
    SForce = function (this: fluentYTDlp): fluentYTDlp {
        //SForce()
        this.options.SForce = noParamText;
        return this;
    };
    noFormatSortForce = function (this: fluentYTDlp): fluentYTDlp {
        //noFormatSortForce()
        this.options.noFormatSortForce = noParamText;
        return this;
    };
    videoMultiStreams = function (this: fluentYTDlp): fluentYTDlp {
        //videoMultiStreams()
        this.options.videoMultiStreams = noParamText;
        return this;
    };
    noVideoMultiStreams = function (this: fluentYTDlp): fluentYTDlp {
        //noVideoMultiStreams()
        this.options.noVideoMultiStreams = noParamText;
        return this;
    };
    audioMultiStreams = function (this: fluentYTDlp): fluentYTDlp {
        //audioMultiStreams()
        this.options.audioMultiStreams = noParamText;
        return this;
    };
    noAudioMultiStreams = function (this: fluentYTDlp): fluentYTDlp {
        //noAudioMultiStreams()
        this.options.noAudioMultiStreams = noParamText;
        return this;
    };
    preferFreeFormats = function (this: fluentYTDlp): fluentYTDlp {
        //preferFreeFormats()
        this.options.preferFreeFormats = noParamText;
        return this;
    };
    noPreferFreeFormats = function (this: fluentYTDlp): fluentYTDlp {
        //noPreferFreeFormats()
        this.options.noPreferFreeFormats = noParamText;
        return this;
    };
    checkFormats = function (this: fluentYTDlp): fluentYTDlp {
        //checkFormats()
        this.options.checkFormats = noParamText;
        return this;
    };
    checkAllFormats = function (this: fluentYTDlp): fluentYTDlp {
        //checkAllFormats()
        this.options.checkAllFormats = noParamText;
        return this;
    };
    noCheckFormats = function (this: fluentYTDlp): fluentYTDlp {
        //noCheckFormats()
        this.options.noCheckFormats = noParamText;
        return this;
    };
    listFormats = function (this: fluentYTDlp): fluentYTDlp {
        //listFormats()
        this.options.listFormats = noParamText;
        return this;
    };
    mergeOutputFormat = function (this: fluentYTDlp, format: string): fluentYTDlp {
        //mergeOutputFormat()
        const logger = new Log('MergeOutputFormat', this.debug);

        //型がstringかをチェックする
        if (typeof format !== 'string' || !format) {
            logger.warning('[mergeOutputFormat]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('mergeOutputFormat')) {
                this.wrongOption.push('mergeOutputFormat');
            }
        }
        this.options.mergeOutputFormat = format;

        return this;
    };

    /* 字幕オプション */
    writeSubs = function (this: fluentYTDlp): fluentYTDlp {
        //writeSubs()
        this.options.writeSubs = noParamText;
        return this;
    };
    noWriteSubs = function (this: fluentYTDlp): fluentYTDlp {
        //noWriteSubs()
        this.options.noWriteSubs = noParamText;
        return this;
    };
    writeAutoSubs = function (this: fluentYTDlp): fluentYTDlp {
        //writeAutoSubs()
        this.options.writeAutoSubs = noParamText;
        return this;
    };
    writeAutomaticSubs = function (this: fluentYTDlp): fluentYTDlp {
        //writeAutomaticSubs()
        this.options.writeAutomaticSubs = noParamText;
        return this;
    };
    noWriteAutoSubs = function (this: fluentYTDlp): fluentYTDlp {
        //noWriteAutoSubs()
        this.options.noWriteAutoSubs = noParamText;
        return this;
    };
    noWriteAutomaticSubs = function (this: fluentYTDlp): fluentYTDlp {
        //noWriteAutomaticSubs()
        this.options.noWriteAutomaticSubs = noParamText;
        return this;
    };
    listSubs = function (this: fluentYTDlp): fluentYTDlp {
        //listSubs()
        this.options.listSubs = noParamText;
        return this;
    };
    subFormat = function (this: fluentYTDlp, format: string): fluentYTDlp {
        //subFormat()
        const logger = new Log('SubFormat', this.debug);

        //型がstringかをチェックする
        if (typeof format !== 'string' || !format) {
            logger.warning('[subFormat]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('subFormat')) {
                this.wrongOption.push('subFormat');
            }
        }
        this.options.subFormat = format;

        return this;
    };
    subLangs = function (this: fluentYTDlp, regex: string): fluentYTDlp {
        //subLangs()
        const logger = new Log('SubLangs', this.debug);

        //型がstringかをチェックする
        if (typeof regex !== 'string' || !regex) {
            logger.warning('[subLangs]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('subLangs')) {
                this.wrongOption.push('subLangs');
            }
        }
        this.options.subLangs = regex;

        return this;
    };

    /* 認証オプション */
    username = function (this: fluentYTDlp, username: string): fluentYTDlp {
        //username()
        const logger = new Log('Username', this.debug);

        //型がstringかをチェックする
        if (typeof username !== 'string' || !username) {
            logger.warning('[username]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('username')) {
                this.wrongOption.push('username');
            }
        }
        this.options.username = username;

        return this;
    };
    password = function (this: fluentYTDlp, password: string): fluentYTDlp {
        //password()
        const logger = new Log('Password', this.debug);

        //型がstringかをチェックする
        if (typeof password !== 'string' || !password) {
            logger.warning('[password]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('password')) {
                this.wrongOption.push('password');
            }
        }
        this.options.password = password;

        return this;
    };
    twofactor = function (this: fluentYTDlp, code: string): fluentYTDlp {
        //twofactor()
        const logger = new Log('Twofactor', this.debug);

        //型がstringかをチェックする
        if (typeof code !== 'string' || !code) {
            logger.warning('[twofactor]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('twofactor')) {
                this.wrongOption.push('twofactor');
            }
        }
        this.options.twofactor = code;

        return this;
    };
    netrc = function (this: fluentYTDlp): fluentYTDlp {
        //netrc()
        this.options.netrc = noParamText;
        return this;
    };
    netrcLocation = function (this: fluentYTDlp, path: string): fluentYTDlp {
        //netrcLocation()
        const logger = new Log('NetrcLocation', this.debug);

        //型がstringかをチェックする
        if (typeof path !== 'string' || !path) {
            logger.warning('[netrcLocation]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('netrcLocation')) {
                this.wrongOption.push('netrcLocation');
            }
        }
        this.options.netrcLocation = path;

        return this;
    };
    videoPassword = function (this: fluentYTDlp, password: string): fluentYTDlp {
        //videoPassword()
        const logger = new Log('VideoPassword', this.debug);

        //型がstringかをチェックする
        if (typeof password !== 'string' || !password) {
            logger.warning('[videoPassword]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('videoPassword')) {
                this.wrongOption.push('videoPassword');
            }
        }
        this.options.videoPassword = password;

        return this;
    };
    apMso = function (this: fluentYTDlp, mso: string): fluentYTDlp {
        //apMso()
        const logger = new Log('ApMso', this.debug);

        //型がstringかをチェックする
        if (typeof mso !== 'string' || !mso) {
            logger.warning('[apMso]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('apMso')) {
                this.wrongOption.push('apMso');
            }
        }
        this.options.apMso = mso;

        return this;
    };
    apUsername = function (this: fluentYTDlp, username: string): fluentYTDlp {
        //apUsername()
        const logger = new Log('ApUsername', this.debug);

        //型がstringかをチェックする
        if (typeof username !== 'string' || !username) {
            logger.warning('[apUsername]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('apUsername')) {
                this.wrongOption.push('apUsername');
            }
        }
        this.options.apUsername = username;

        return this;
    };
    apPassword = function (this: fluentYTDlp, password: string): fluentYTDlp {
        //apPassword()
        const logger = new Log('ApPassword', this.debug);

        //型がstringかをチェックする
        if (typeof password !== 'string' || !password) {
            logger.warning('[apPassword]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('apPassword')) {
                this.wrongOption.push('apPassword');
            }
        }
        this.options.apPassword = password;

        return this;
    };
    apListMso = function (this: fluentYTDlp): fluentYTDlp {
        //apListMso()
        this.options.apListMso = noParamText;
        return this;
    };
    clientCertificate = function (this: fluentYTDlp, path: string): fluentYTDlp {
        //clientCertificate()
        const logger = new Log('ClientCertificate', this.debug);

        //型がstringかをチェックする
        if (typeof path !== 'string' || !path) {
            logger.warning('[clientCertificate]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('clientCertificate')) {
                this.wrongOption.push('clientCertificate');
            }
        }
        this.options.clientCertificate = path;

        return this;
    };
    clientCertificateKey = function (this: fluentYTDlp, path: string): fluentYTDlp {
        //clientCertificateKey()
        const logger = new Log('ClientCertificateKey', this.debug);

        //型がstringかをチェックする
        if (typeof path !== 'string' || !path) {
            logger.warning('[clientCertificateKey]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('clientCertificateKey')) {
                this.wrongOption.push('clientCertificateKey');
            }
        }
        this.options.clientCertificateKey = path;

        return this;
    };
    clientCertificatePassword = function (this: fluentYTDlp, password: string): fluentYTDlp {
        //clientCertificatePassword()
        const logger = new Log('ClientCertificatePassword', this.debug);

        //型がstringかをチェックする
        if (typeof password !== 'string' || !password) {
            logger.warning('[clientCertificatePassword]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('clientCertificatePassword')) {
                this.wrongOption.push('clientCertificatePassword');
            }
        }
        this.options.clientCertificatePassword = password;

        return this;
    };

    /* ポストプロセッサーオプション */
    extractAudio = function (this: fluentYTDlp): fluentYTDlp {
        //extractAudio()
        this.options.extractAudio = noParamText;
        return this;
    };
    audioFormat = function (this: fluentYTDlp, format: string): fluentYTDlp {
        //audioFormat()
        const logger = new Log('AudioFormat', this.debug);

        //型がstringかをチェックする
        if (typeof format !== 'string' || !format) {
            logger.warning('[audioFormat]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('audioFormat')) {
                this.wrongOption.push('audioFormat');
            }
        }
        this.options.audioFormat = format;

        return this;
    };
    audioQuality = function (this: fluentYTDlp, quality: string): fluentYTDlp {
        //audioQuality()
        const logger = new Log('AudioQuality', this.debug);

        //型がstringかをチェックする
        if (typeof quality !== 'string' || !quality) {
            logger.warning('[audioQuality]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('audioQuality')) {
                this.wrongOption.push('audioQuality');
            }
        }
        this.options.audioQuality = quality;

        return this;
    };
    remuxVideo = function (this: fluentYTDlp, format: string): fluentYTDlp {
        //remuxVideo()
        const logger = new Log('RemuxVideo', this.debug);

        //型がstringかをチェックする
        if (typeof format !== 'string' || !format) {
            logger.warning('[remuxVideo]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('remuxVideo')) {
                this.wrongOption.push('remuxVideo');
            }
        }
        this.options.remuxVideo = format;

        return this;
    };
    recodeVideo = function (this: fluentYTDlp, format: string): fluentYTDlp {
        //recodeVideo()
        const logger = new Log('RecodeVideo', this.debug);

        //型がstringかをチェックする
        if (typeof format !== 'string' || !format) {
            logger.warning('[recodeVideo]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('recodeVideo')) {
                this.wrongOption.push('recodeVideo');
            }
        }
        this.options.recodeVideo = format;

        return this;
    };
    postProcessorArgs = function (this: fluentYTDlp, args: string): fluentYTDlp {
        //postProcessorArgs()
        const logger = new Log('PostProcessorArgs', this.debug);

        //型がstringかをチェックする
        if (typeof args !== 'string' || !args) {
            logger.warning('[postProcessorArgs]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('postProcessorArgs')) {
                this.wrongOption.push('postProcessorArgs');
            }
        }
        this.options.postProcessorArgs = args;

        return this;
    };
    ppa = function (this: fluentYTDlp, args: string): fluentYTDlp {
        //ppa()
        const logger = new Log('Ppa', this.debug);

        //型がstringかをチェックする
        if (typeof args !== 'string' || !args) {
            logger.warning('[ppa]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('ppa')) {
                this.wrongOption.push('ppa');
            }
        }
        this.options.ppa = args;

        return this;
    };
    keepVideo = function (this: fluentYTDlp): fluentYTDlp {
        //keepVideo()
        this.options.keepVideo = noParamText;
        return this;
    };
    noKeepVideo = function (this: fluentYTDlp): fluentYTDlp {
        //noKeepVideo()
        this.options.noKeepVideo = noParamText;
        return this;
    };
    postOverwrites = function (this: fluentYTDlp): fluentYTDlp {
        //postOverwrites()
        this.options.postOverwrites = noParamText;
        return this;
    };
    noPostOverwrites = function (this: fluentYTDlp): fluentYTDlp {
        //noPostOverwrites()
        this.options.noPostOverwrites = noParamText;
        return this;
    };
    embedSubs = function (this: fluentYTDlp): fluentYTDlp {
        //embedSubs()
        this.options.embedSubs = noParamText;
        return this;
    };
    noEmbedSubs = function (this: fluentYTDlp): fluentYTDlp {
        //noEmbedSubs()
        this.options.noEmbedSubs = noParamText;
        return this;
    };
    embedThumbnail = function (this: fluentYTDlp): fluentYTDlp {
        //embedThumbnail()
        this.options.embedThumbnail = noParamText;
        return this;
    };
    noEmbedThumbnail = function (this: fluentYTDlp): fluentYTDlp {
        //noEmbedThumbnail()
        this.options.noEmbedThumbnail = noParamText;
        return this;
    };
    embedMetadata = function (this: fluentYTDlp): fluentYTDlp {
        //embedMetadata()
        this.options.embedMetadata = noParamText;
        return this;
    };
    addMetadata = function (this: fluentYTDlp): fluentYTDlp {
        //addMetadata()
        this.options.addMetadata = noParamText;
        return this;
    };
    noEmbedMetadata = function (this: fluentYTDlp): fluentYTDlp {
        //noEmbedMetadata()
        this.options.noEmbedMetadata = noParamText;
        return this;
    };
    noAddMetadata = function (this: fluentYTDlp): fluentYTDlp {
        //noAddMetadata()
        this.options.noAddMetadata = noParamText;
        return this;
    };
    embedChapters = function (this: fluentYTDlp): fluentYTDlp {
        //embedChapters()
        this.options.embedChapters = noParamText;
        return this;
    };
    addChapters = function (this: fluentYTDlp): fluentYTDlp {
        //addChapters()
        this.options.addChapters = noParamText;
        return this;
    };
    noEmbedChapters = function (this: fluentYTDlp): fluentYTDlp {
        //noEmbedChapters()
        this.options.noEmbedChapters = noParamText;
        return this;
    };
    noAddChapters = function (this: fluentYTDlp): fluentYTDlp {
        //noAddChapters()
        this.options.noAddChapters = noParamText;
        return this;
    };
    embedInfoJson = function (this: fluentYTDlp): fluentYTDlp {
        //embedInfoJson()
        this.options.embedInfoJson = noParamText;
        return this;
    };
    noEmbedInfoJson = function (this: fluentYTDlp): fluentYTDlp {
        //noEmbedInfoJson()
        this.options.noEmbedInfoJson = noParamText;
        return this;
    };
    parseMetadata = function (this: fluentYTDlp, fromTo: string): fluentYTDlp {
        //parseMetadata()
        const logger = new Log('ParseMetadata', this.debug);

        //型がstringかをチェックする
        if (typeof fromTo !== 'string' || !fromTo) {
            logger.warning('[parseMetadata]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('parseMetadata')) {
                this.wrongOption.push('parseMetadata');
            }
        }
        this.options.parseMetadata = fromTo;

        return this;
    };
    replaceInMetadata = function (this: fluentYTDlp, fields: string): fluentYTDlp {
        //replaceInMetadata()
        const logger = new Log('ReplaceInMetadata', this.debug);

        //型がstringかをチェックする
        if (typeof fields !== 'string' || !fields) {
            logger.warning('[replaceInMetadata]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('replaceInMetadata')) {
                this.wrongOption.push('replaceInMetadata');
            }
        }
        this.options.replaceInMetadata = fields;

        return this;
    };
    xattrs = function (this: fluentYTDlp): fluentYTDlp {
        //xattrs()
        this.options.xattrs = noParamText;
        return this;
    };
    concatPlaylist = function (this: fluentYTDlp, policy: string): fluentYTDlp {
        //concatPlaylist()
        const logger = new Log('ConcatPlaylist', this.debug);

        //型がstringかをチェックする
        if (typeof policy !== 'string' || !policy) {
            logger.warning('[concatPlaylist]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('concatPlaylist')) {
                this.wrongOption.push('concatPlaylist');
            }
        }
        this.options.concatPlaylist = policy;

        return this;
    };
    fixup = function (this: fluentYTDlp, policy: string): fluentYTDlp {
        //fixup()
        const logger = new Log('Fixup', this.debug);

        //型がstringかをチェックする
        if (typeof policy !== 'string' || !policy) {
            logger.warning('[fixup]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('fixup')) {
                this.wrongOption.push('fixup');
            }
        }
        this.options.fixup = policy;

        return this;
    };
    ffmpegLocation = function (this: fluentYTDlp, path: string): fluentYTDlp {
        //ffmpegLocation()
        const logger = new Log('FfmpegLocation', this.debug);

        //型がstringかをチェックする
        if (typeof path !== 'string' || !path) {
            logger.warning('[ffmpegLocation]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('ffmpegLocation')) {
                this.wrongOption.push('ffmpegLocation');
            }
        }
        this.options.ffmpegLocation = path;

        return this;
    };
    exec = function (this: fluentYTDlp, cmd: string): fluentYTDlp {
        //exec()
        const logger = new Log('Exec', this.debug);

        //型がstringかをチェックする
        if (typeof cmd !== 'string' || !cmd) {
            logger.warning('[exec]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('exec')) {
                this.wrongOption.push('exec');
            }
        }
        this.options.exec = cmd;

        return this;
    };
    noExec = function (this: fluentYTDlp): fluentYTDlp {
        //noExec()
        this.options.noExec = noParamText;
        return this;
    };
    convertSubs = function (this: fluentYTDlp, format: string): fluentYTDlp {
        //convertSubs()
        const logger = new Log('ConvertSubs', this.debug);

        //型がstringかをチェックする
        if (typeof format !== 'string' || !format) {
            logger.warning('[convertSubs]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('convertSubs')) {
                this.wrongOption.push('convertSubs');
            }
        }
        this.options.convertSubs = format;

        return this;
    };
    convertSubtitles = function (this: fluentYTDlp, format: string): fluentYTDlp {
        //convertSubtitles()
        const logger = new Log('ConvertSubtitles', this.debug);

        //型がstringかをチェックする
        if (typeof format !== 'string' || !format) {
            logger.warning('[convertSubtitles]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('convertSubtitles')) {
                this.wrongOption.push('convertSubtitles');
            }
        }
        this.options.convertSubtitles = format;

        return this;
    };
    convertThumbnails = function (this: fluentYTDlp, format: string): fluentYTDlp {
        //convertThumbnails()
        const logger = new Log('ConvertThumbnails', this.debug);

        //型がstringかをチェックする
        if (typeof format !== 'string' || !format) {
            logger.warning('[convertThumbnails]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('convertThumbnails')) {
                this.wrongOption.push('convertThumbnails');
            }
        }
        this.options.convertThumbnails = format;

        return this;
    };
    splitChapters = function (this: fluentYTDlp): fluentYTDlp {
        //splitChapters()
        this.options.splitChapters = noParamText;
        return this;
    };
    noSplitChapters = function (this: fluentYTDlp): fluentYTDlp {
        //noSplitChapters()
        this.options.noSplitChapters = noParamText;
        return this;
    };
    removeChapters = function (this: fluentYTDlp, regex: string): fluentYTDlp {
        //removeChapters()
        const logger = new Log('RemoveChapters', this.debug);

        //型がstringかをチェックする
        if (typeof regex !== 'string' || !regex) {
            logger.warning('[removeChapters]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('removeChapters')) {
                this.wrongOption.push('removeChapters');
            }
        }
        this.options.removeChapters = regex;

        return this;
    };
    noRemoveChapters = function (this: fluentYTDlp): fluentYTDlp {
        //noRemoveChapters()
        this.options.noRemoveChapters = noParamText;
        return this;
    };
    forceKeyframesAtCuts = function (this: fluentYTDlp): fluentYTDlp {
        //forceKeyframesAtCuts()
        this.options.forceKeyframesAtCuts = noParamText;
        return this;
    };
    noForceKeyframesAtCuts = function (this: fluentYTDlp): fluentYTDlp {
        //noForceKeyframesAtCuts()
        this.options.noForceKeyframesAtCuts = noParamText;
        return this;
    };
    usePostProcessor = function (this: fluentYTDlp, postProcessor: string): fluentYTDlp {
        //usePostProcessor()
        const logger = new Log('UsePostProcessor', this.debug);

        //型がstringかをチェックする
        if (typeof postProcessor !== 'string' || !postProcessor) {
            logger.warning('[usePostProcessor]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('usePostProcessor')) {
                this.wrongOption.push('usePostProcessor');
            }
        }
        this.options.usePostProcessor = postProcessor;

        return this;
    };

    /* SponsorBlockオプション */
    sponsorBlockMark = function (this: fluentYTDlp, cats: string): fluentYTDlp {
        //sponsorBlockMark()
        const logger = new Log('SponsorBlockMark', this.debug);

        //型がstringかをチェックする
        if (typeof cats !== 'string' || !cats) {
            logger.warning('[sponsorBlockMark]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('sponsorBlockMark')) {
                this.wrongOption.push('sponsorBlockMark');
            }
        }
        this.options.sponsorBlockMark = cats;

        return this;
    };
    sponsorBlockRemove = function (this: fluentYTDlp, cats: string): fluentYTDlp {
        //sponsorBlockRemove()
        const logger = new Log('SponsorBlockRemove', this.debug);

        //型がstringかをチェックする
        if (typeof cats !== 'string' || !cats) {
            logger.warning('[sponsorBlockRemove]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('sponsorBlockRemove')) {
                this.wrongOption.push('sponsorBlockRemove');
            }
        }
        this.options.sponsorBlockRemove = cats;

        return this;
    };
    sponsorBlockChapterTitle = function (this: fluentYTDlp, template: string): fluentYTDlp {
        //sponsorBlockChapterTitle()
        const logger = new Log('SponsorBlockChapterTitle', this.debug);

        //型がstringかをチェックする
        if (typeof template !== 'string' || !template) {
            logger.warning('[sponsorBlockChapterTitle]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('sponsorBlockChapterTitle')) {
                this.wrongOption.push('sponsorBlockChapterTitle');
            }
        }
        this.options.sponsorBlockChapterTitle = template;

        return this;
    };
    noSponsorBlock = function (this: fluentYTDlp): fluentYTDlp {
        //noSponsorBlock()
        this.options.noSponsorBlock = noParamText;
        return this;
    };
    sponsorBlockApi = function (this: fluentYTDlp): fluentYTDlp {
        //sponsorBlockApi()
        this.options.sponsorBlockApi = noParamText;
        return this;
    };

    /* Extractor オプション */
    extractorRetries = function (this: fluentYTDlp, retries: string | number): fluentYTDlp {
        //extractorRetries()
        const logger = new Log('ExtractorRetries', this.debug);

        //型がstringまたはnumberかをチェックする
        if (!['string', 'number'].includes(typeof retries) || !retries) {
            logger.warning('[extractorRetries]の引数の型が「String」または「Number」ではない可能性があります。');
            if (!this.wrongOption.includes('extractorRetries')) {
                this.wrongOption.push('extractorRetries');
            }
        }
        this.options.extractorRetries = retries.toString();

        return this;
    };
    allowDynamicMpd = function (this: fluentYTDlp): fluentYTDlp {
        //allowDynamicMpd()
        this.options.allowDynamicMpd = noParamText;
        return this;
    };
    noIgnoreDynamicMpd = function (this: fluentYTDlp): fluentYTDlp {
        //noIgnoreDynamicMpd()
        this.options.noIgnoreDynamicMpd = noParamText;
        return this;
    };
    ignoreDynamicMpd = function (this: fluentYTDlp): fluentYTDlp {
        //ignoreDynamicMpd()
        this.options.ignoreDynamicMpd = noParamText;
        return this;
    };
    noAllowDynamicMpd = function (this: fluentYTDlp): fluentYTDlp {
        //noAllowDynamicMpd()
        this.options.noAllowDynamicMpd = noParamText;
        return this;
    };
    hlsSplitDiscontinuity = function (this: fluentYTDlp): fluentYTDlp {
        //hlsSplitDiscontinuity()
        this.options.hlsSplitDiscontinuity = noParamText;
        return this;
    };
    noHlsSplitDiscontinuity = function (this: fluentYTDlp): fluentYTDlp {
        //noHlsSplitDiscontinuity()
        this.options.noHlsSplitDiscontinuity = noParamText;
        return this;
    };
    extractorArgs = function (this: fluentYTDlp, args: string): fluentYTDlp {
        //extractorArgs()
        const logger = new Log('ExtractorArgs', this.debug);

        //型がstringかをチェックする
        if (typeof args !== 'string' || !args) {
            logger.warning('[extractorArgs]の引数の型が「String」ではない可能性があります。');
            if (!this.wrongOption.includes('extractorArgs')) {
                this.wrongOption.push('extractorArgs');
            }
        }
        this.options.extractorArgs = args;

        return this;
    };
}

export = fluentYTDlp;

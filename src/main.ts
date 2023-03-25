/**
 * Fluent-ytdlp - Copyright © 2023 YBD Project - MIT License
 */

'use strict';

type YTDlpOptionsData = {[key: string]: string | number | boolean | RegExp | Date | object};

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

type NoStreamRunOptions = {
    type: 'exec' | 'execFile';
    callback: any;
    force?: boolean;
};

import {spawn, execFile, exec, ChildProcessWithoutNullStreams, ChildProcess} from 'node:child_process';
import fs from 'node:fs';
import Log from './functions/log';
import option from './functions/option';

const {binaryPath, os} = JSON.parse(fs.readFileSync(process.cwd() + '/bin/info.json', 'utf8'));

//yt-dlpのオプションを生成する
function generateOption(
    {debug, wrongOption, options}: {debug: boolean; wrongOption: Array<string>; options: YTDlpOptionsData},
    runOptions: RunOptions | NoStreamRunOptions,
): Array<any> {
    const logger = new Log('generateOption', debug),
        exception = ['url', 'width', 'height', 'filename', 'extension'];
    return Object.entries(options).reduce<any>((previous, [name, param]) => {
        if (exception.includes(name)) {
            if (name === 'url') {
                if (os.platform !== 'windows') {
                    param = param.toString().replace('"', '');
                }
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
            if (wrongOption.includes(name)) {
                if (runOptions.force !== true) {
                    logger.warning('[' + name + ']: このオプションは間違った引数が指定されている可能性があるため適応されませんでした。');
                    return previous;
                }
                logger.warning('[' + name + ']: このオプションは間違った引数が指定されている可能性がありますが、設定により強制的に適応されます。');
            }
            if (!previous.includes(option.decode(name))) {
                previous.push('--' + option.decode(name));
                previous.push(param);
            } else {
                previous.push('--' + option.decode(name));
                if (param !== 'Option with no parameters.') {
                    previous.push(param);
                }
            }
        }
        return previous;
    }, []);
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
        }
        this.options.url = url;
    }

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

        return ytdlpProcess;
    };

    /* 簡易オプション */
    resolution = function (this: fluentYTDlp, resolution: string): fluentYTDlp {
        const logger = new Log('Resolution', this.debug),
            [width, height] = resolution.split('x');
        if (!resolution.includes('x')) {
            logger.warning('このオプションの引数が「横×縦」で指定されていない可能性があります。');
        }
        if (typeof resolution !== 'string' || !resolution) {
            logger.warning('このオプションの引数の型が「String」ではない可能性があります。');
        }
        this.options.width = width;
        this.options.height = height;
        return this;
    };
    width = function (this: fluentYTDlp, _width: string | number): fluentYTDlp {
        const logger = new Log('Width', this.debug),
            width = _width.toString();

        //_widthが数字か、型がstringまたはnumberかをチェックする
        if (isNaN(+width) || ['string', 'number'].includes(typeof _width)) {
            logger.warning('このオプションに指定された値は数字ではないか、型が「String」または「Number」ではない可能性があります。');
            this.wrongOption.push('width');
        }

        this.options.width = width;
        return this;
    };
    height = function (this: fluentYTDlp, _height: string | number): fluentYTDlp {
        const logger = new Log('Height', this.debug),
            height = _height.toString();

        //_heightが数字か、型がstringまたはnumberかをチェックする
        if (isNaN(+height) || ['string', 'number'].includes(typeof _height) || !_height) {
            logger.warning('このオプションに指定された値は数字ではないか、型が「String」または「Number」ではない可能性があります。');
            this.wrongOption.push('height');
        }

        this.options.height = height;
        return this;
    };
    filename = function (this: fluentYTDlp, filename: string): fluentYTDlp {
        const logger = new Log('Filename', this.debug);

        //型がstringかをチェックする
        if (typeof filename !== 'string' || !filename) {
            logger.warning('このオプションに指定された値は型が「String」ではない可能性があります。');
            this.wrongOption.push('filename');
        }

        this.options.filename = filename;
        return this;
    };
    extension = function (this: fluentYTDlp, extension: string): fluentYTDlp {
        const logger = new Log('Extension', this.debug);

        //型がstringかをチェックする
        if (typeof extension !== 'string' || !extension) {
            logger.warning('このオプションに指定された値は型が「String」ではない可能性があります。');
            this.wrongOption.push('extension');
        }

        this.options.extension = extension;
        return this;
    };

    /* その他のオプション */
    url = function (this: fluentYTDlp, url: string): fluentYTDlp {
        const logger = new Log('Url', this.debug);
        if (typeof url !== 'string' || !url) {
            logger.warning('このオプションの引数の型が「String」ではない可能性があります。');
        }
        this.options.url = url;
        return this;
    };
    otherOptions = function (this: fluentYTDlp, otherOptions: YTDlpOptionsData): fluentYTDlp {
        const logger = new Log('OtherOptions', this.debug);
        if (typeof otherOptions !== 'object' || !otherOptions) {
            logger.warning('このオプションの引数の型が「Object」ではない可能性があります。');
        }
        Object.entries(otherOptions).forEach(([key, param]) => {
            this.options[key] = param;
        });
        return this;
    };
    _ytdlpPath = function (): string {
        return binaryPath.ytdlp;
    };
    _ffmpegPath = function (): string {
        return binaryPath.ffmpeg;
    };
    _ffprobePath = function (): string {
        return binaryPath.ffprobe;
    };
    _binPath = function (): string {
        return binaryPath.folder;
    };

    /* yt-dlpに関するオプション */
    /*     resolution = function (this: fluentYTDlp, resolution: string): fluentYTDlp {
        const logger = new Log('resolution', this.debug);
        return this;
    }; */
}

export = fluentYTDlp;

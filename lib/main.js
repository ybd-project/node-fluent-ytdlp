/**
 * Fluent-ytdlp - Copyright © 2023 YBD Project - MIT License
 */
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const node_child_process_1 = require("node:child_process");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const chalk_1 = __importDefault(require("chalk"));
const arch_1 = __importDefault(require("arch"));
const update_notifier_1 = __importDefault(require("update-notifier"));
const log_1 = __importDefault(require("./functions/log"));
const option_1 = __importDefault(require("./functions/option"));
const noParamText = 'Option with no parameter', { binaryPath, os } = (() => {
    try {
        return JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(__dirname + '/../bin/info.json'), 'utf8'));
    }
    catch (err) {
        console.log('[FLUENT-YTDLP]: yt-dlp等がダウンロードされた際に生成されるJSONファイルが読み込めないため、「setBinaryPath();」でパスを設定してください。');
        return {
            binaryPath: {
                ytdlp: '',
                ffmpeg: '',
                ffprobe: '',
                folder: '',
            },
            os: {
                platform: (() => {
                    //ここでwindows・linux・macosの三種類に分別する
                    let platform = '';
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
                arch: (0, arch_1.default)(),
            },
        };
    }
})();
//yt-dlpのオプションを生成する
function generateOption({ debug, wrongOption, options }, runOptions) {
    const logger = new log_1.default('generateOption', debug), exception = ['url', 'width', 'height', 'filename', 'extension'], optionData = Object.entries(options).reduce((previous, [name, param]) => {
        if (wrongOption.includes(name)) {
            if (runOptions.force !== true) {
                logger.warning('[' + name + ']は間違った引数が指定されている可能性があるため適応されませんでした。');
                return previous;
            }
            logger.warning('[' + name + ']は間違った引数が指定されている可能性がありますが、設定により強制的に適応されます。');
        }
        if (exception.includes(name) && param !== null) {
            if (name === 'width' || name === 'height') {
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
                }
                else {
                    previous[previous.indexOf('--format') + 1] += '[' + name + '=' + param + ']+bestaudio';
                }
            }
            else if (name === 'filename') {
                const output = '"' + param + '.%(ext)s"';
                if (!previous.includes('--output')) {
                    previous.push('--output');
                    previous.push(output);
                }
                else {
                    previous[previous.indexOf('--output') + 1] = output;
                }
            }
            else if (name === 'extension') {
                if (!previous.includes('--merge-output-format')) {
                    previous.push('--merge-output-format');
                    previous.push(param);
                }
                else {
                    previous[previous.indexOf('----merge-output-format') + 1] = param;
                }
            }
        }
        else {
            previous.push('--' + option_1.default.decode(name));
            if (param !== noParamText || param !== null) {
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
function childProcessCloseEvent(code) {
    const logger = new log_1.default('ChildProcessCloseEvent', true);
    const text = '処理は、コード「' + code + '」で終了しました。';
    if (code == 0) {
        logger.success(text);
    }
    else {
        logger.error(text);
    }
}
//YYYYMMDDの形式の日付文字列を生成する
function createDate(date) {
    //参考: https://qiita.com/TKFM21/items/88c3d89b3c0666217b56
    return date.getFullYear().toString() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2);
}
class fluentYTDlp {
    options = {};
    wrongOption = [];
    debug = false;
    constructor(url, debug = false) {
        //new FluentYTDlp('URL');
        this.debug = debug;
        const logger = new log_1.default('Constructor', this.debug);
        if (!url) {
            logger.warning('インスタンス生成時にURLは指定されませんでした。');
            this.wrongOption.push('url');
        }
        this.options.url = url;
    }
    /* yt-dlpなどのバイナリパスの設定 */
    setBinaryPath = function ({ ytdlp, ffmpeg, ffprobe }) {
        if (ytdlp) {
            binaryPath.ytdlp = ytdlp;
            binaryPath.folder = node_path_1.default.dirname(ytdlp);
        }
        if (ffmpeg) {
            binaryPath.ffmpeg = ffmpeg;
            binaryPath.folder = node_path_1.default.dirname(ffmpeg);
        }
        if (ffprobe) {
            binaryPath.ffprobe = ffprobe;
            binaryPath.folder = node_path_1.default.dirname(ffprobe);
        }
    };
    /* yt-dlpの実行に関するオプション */
    run = function (runOptions = {}) {
        //run()
        const logger = new log_1.default('Run', this.debug), options = generateOption({ debug: this.debug, wrongOption: this.wrongOption, options: this.options }, runOptions), ytdlpProcess = (0, node_child_process_1.spawn)(binaryPath.ytdlp, options, runOptions.spawnOptions || { shell: true });
        logger.log('OK');
        if (this.debug === true) {
            ytdlpProcess.on('close', childProcessCloseEvent);
        }
        return ytdlpProcess;
    };
    scheduleRun = function (runOptions = { schedule: '' }) {
        //scheduleRun()
        const logger = new log_1.default('ScheduleRun', this.debug), options = generateOption({ debug: this.debug, wrongOption: this.wrongOption, options: this.options }, runOptions), waitTime = Math.floor(new Date(runOptions.schedule || '').getTime() - Date.now());
        return new Promise((resolve, reject) => {
            if (!runOptions.schedule || typeof runOptions.schedule !== 'string' || Math.sign(waitTime) === -1) {
                reject('スケジュールの値がないか過去の時刻を指定している場合があります。');
            }
            else {
                setTimeout(() => {
                    const ytdlpProcess = (0, node_child_process_1.spawn)(binaryPath.ytdlp, options, runOptions.spawnOptions || { shell: true });
                    if (this.debug === true) {
                        ytdlpProcess.on('close', childProcessCloseEvent);
                    }
                    logger.log('OK');
                    resolve(ytdlpProcess);
                }, waitTime);
            }
        });
    };
    noStreamRun = function (runOptions = { type: 'execFile', callback: function () { }, force: false }) {
        //noStreamRun()
        const logger = new log_1.default('NoStreamRun', this.debug), options = generateOption({ debug: this.debug, wrongOption: this.wrongOption, options: this.options }, runOptions), ytdlpProcess = (() => {
            if (runOptions.type === 'exec') {
                return (0, node_child_process_1.exec)([binaryPath.ytdlp, ...options].join(' '), runOptions.callback);
            }
            else {
                return (0, node_child_process_1.execFile)(binaryPath.ytdlp, options, runOptions.callback);
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
    resolution = function (resolution) {
        //resolution()
        const logger = new log_1.default('Resolution', this.debug), [width, height] = resolution.split('x');
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
    width = function (_width) {
        //width()
        const logger = new log_1.default('Width', this.debug), width = _width.toString();
        //_widthが数字か、型がstringまたはnumberかをチェックする
        if (isNaN(+width) || ['string', 'number'].includes(typeof _width)) {
            logger.warning('[width]に指定された値は数字ではないか、型が「String」または「Number」ではない可能性があります。');
            this.wrongOption.push('width');
        }
        this.options.width = width.toString();
        return this;
    };
    height = function (_height) {
        //height()
        const logger = new log_1.default('Height', this.debug), height = _height.toString();
        //_heightが数字か、型がstringまたはnumberかをチェックする
        if (isNaN(+height) || ['string', 'number'].includes(typeof _height) || !_height) {
            logger.warning('[height]に指定された値は数字ではないか、型が「String」または「Number」ではない可能性があります。');
            this.wrongOption.push('height');
        }
        this.options.height = height.toString();
        return this;
    };
    filename = function (filename) {
        //filename()
        const logger = new log_1.default('Filename', this.debug);
        //型がstringかをチェックする
        if (typeof filename !== 'string' || !filename) {
            logger.warning('[filename]に指定された値は型が「String」ではない可能性があります。');
            this.wrongOption.push('filename');
        }
        this.options.filename = filename;
        return this;
    };
    extension = function (extension) {
        //extension()
        const logger = new log_1.default('Extension', this.debug);
        //型がstringかをチェックする
        if (typeof extension !== 'string' || !extension) {
            logger.warning('[extension]に指定された値は型が「String」ではない可能性があります。');
            this.wrongOption.push('extension');
        }
        this.options.extension = extension;
        return this;
    };
    /* その他のオプション */
    url = function (url) {
        //url()
        const logger = new log_1.default('Url', this.debug);
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
    otherOptions = function (otherOptions) {
        //otherOptions()
        const logger = new log_1.default('OtherOptions', this.debug);
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
    _ytdlpPath = function () {
        //_ytdlpPath()
        return binaryPath.ytdlp;
    };
    _ffmpegPath = function () {
        //_ffmpegPath()
        return binaryPath.ffmpeg;
    };
    _ffprobePath = function () {
        //_ffprobePath()
        return binaryPath.ffprobe;
    };
    _binPath = function () {
        //_binPath()
        return binaryPath.folder;
    };
    /* yt-dlpに関するオプション */
    help = function () {
        //help()
        this.options.help = noParamText;
        return this;
    };
    version = function () {
        //version()
        this.options.version = noParamText;
        return this;
    };
    update = function () {
        //update()
        this.options.update = noParamText;
        return this;
    };
    noUpdate = function () {
        //noUpdate()
        this.options.noUpdate = noParamText;
        return this;
    };
    updateTo = function (version) {
        //updateTo()
        const logger = new log_1.default('UpdateTo', this.debug);
        //型がstringかをチェックする
        if (typeof version !== 'string' || !version) {
            logger.warning('[updateTo]の引数の型が「String」ではない可能性があります。');
            this.wrongOption.push('updateTo');
        }
        this.options.updateTo = version;
        return this;
    };
    /* 一般オプション */
    ignoreErrors = function () {
        //ignoreErrors()
        this.options.ignoreErrors = noParamText;
        return this;
    };
    abortOnError = function () {
        //abortOnError()
        this.options.abortOnError = noParamText;
        return this;
    };
    noIgnoreErrors = function () {
        //noIgnoreErrors()
        this.options.noIgnoreErrors = noParamText;
        return this;
    };
    noAbortOnError = function () {
        //noAbortOnError()
        this.options.noAbortOnError = noParamText;
        return this;
    };
    dumpUserAgent = function () {
        //dumpUserAgent()
        this.options.dumpUserAgent = noParamText;
        return this;
    };
    listExtractors = function () {
        //listExtractors()
        this.options.listExtractors = noParamText;
        return this;
    };
    extractorDescriptions = function () {
        //extractorDescriptions()
        this.options.extractorDescriptions = noParamText;
        return this;
    };
    useExtractors = function (extractor) {
        //useExtractors()
        const logger = new log_1.default('UseExtractors', this.debug);
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
    defaultSearch = function (method) {
        //defaultSearch()
        const logger = new log_1.default('DefaultSearch', this.debug);
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
    configLocation = function (path) {
        //configLocation()
        const logger = new log_1.default('ConfigLocation', this.debug);
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
    ignoreConfig = function () {
        //ignoreConfig()
        this.options.ignoreConfig = noParamText;
        return this;
    };
    noConfig = function () {
        //noConfig()
        this.options.noConfig = noParamText;
        return this;
    };
    noConfigLocations = function () {
        //noConfigLocations()
        this.options.noConfigLocations = noParamText;
        return this;
    };
    flatPlaylist = function () {
        //flatPlaylist()
        this.options.flatPlaylist = noParamText;
        return this;
    };
    noFlatPlaylist = function () {
        //noFlatPlaylist()
        this.options.noFlatPlaylist = noParamText;
        return this;
    };
    liveFromStart = function () {
        //liveFromStart()
        const logger = new log_1.default('LiveFromStart', this.debug);
        logger.warning('[liveFromStart]は実験的である可能性があります。（fluent-ytdlp v1.0.0公開時）');
        this.options.liveFromStart = noParamText;
        return this;
    };
    noLiveFromStart = function () {
        //noLiveFromStart()
        this.options.noLiveFromStart = noParamText;
        return this;
    };
    waitForVideo = function (seconds) {
        //waitForVideo()
        const logger = new log_1.default('WaitForVideo', this.debug);
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
    noWaitForVideo = function () {
        //noWaitForVideo()
        this.options.noWaitForVideo = noParamText;
        return this;
    };
    markWatched = function () {
        //markWatched()
        this.options.markWatched = noParamText;
        return this;
    };
    noMarkWatched = function () {
        //noMarkWatched()
        this.options.noMarkWatched = noParamText;
        return this;
    };
    noColors = function () {
        //noColors()
        this.options.noColors = noParamText;
        return this;
    };
    compatOptions = function (opts) {
        //compatOptions()
        const logger = new log_1.default('CompatOptions', this.debug);
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
    proxy = function (proxyUrl) {
        //proxy()
        const logger = new log_1.default('Proxy', this.debug);
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
    socketTimeout = function (seconds) {
        //socketTimeout()
        const logger = new log_1.default('SocketTimeout', this.debug);
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
    sourceAddress = function (address) {
        //sourceAddress()
        const logger = new log_1.default('SourceAddress', this.debug);
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
    forceIpv4 = function () {
        //forceIpv4()
        this.options.forceIpv4 = noParamText;
        return this;
    };
    forceIpv6 = function () {
        //forceIpv6()
        this.options.forceIpv6 = noParamText;
        return this;
    };
    enableFileUrls = function () {
        //enableFileUrls()
        this.options.enableFileUrls = noParamText;
        return this;
    };
    geoVerificationProxy = function (proxyUrl) {
        //geoVerificationProxy()
        const logger = new log_1.default('GeoVerificationProxy', this.debug);
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
    geoBypass = function () {
        //geoBypass()
        this.options.geoBypass = noParamText;
        return this;
    };
    noGeoBypass = function () {
        //noGeoBypass()
        this.options.noGeoBypass = noParamText;
        return this;
    };
    geoBypassCountry = function (countryCode) {
        //geoBypassCountry()
        const logger = new log_1.default('GeoBypassCountry', this.debug);
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
    geoBypassIpBlock = function (ipBlock) {
        //geoBypassIpBlock()
        const logger = new log_1.default('GeoBypassIpBlock', this.debug);
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
    playlistItems = function (index) {
        //playlistItems()
        const logger = new log_1.default('PlaylistItems', this.debug);
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
    maxDownloads = function (max) {
        //maxDownloads()
        const logger = new log_1.default('MaxDownloads', this.debug);
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
    minFileSize = function (size) {
        //minFileSize()
        const logger = new log_1.default('MinFileSize', this.debug);
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
    maxFileSize = function (size) {
        //maxFileSize()
        const logger = new log_1.default('MaxFileSize', this.debug);
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
    date = function (_date) {
        //date()
        const logger = new log_1.default('Date', this.debug), date = typeof _date === 'object' ? createDate(_date) : _date;
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
    dateBefore = function (_date) {
        //dateBefore()
        const logger = new log_1.default('DateBefore', this.debug), date = typeof _date === 'object' ? createDate(_date) : _date;
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
    dateAfter = function (_date) {
        //dateAfter()
        const logger = new log_1.default('DateAfter', this.debug), date = typeof _date === 'object' ? createDate(_date) : _date;
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
    matchFilters = function (filter) {
        //matchFilters()
        const logger = new log_1.default('MatchFilters', this.debug);
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
    noMatchFilter = function () {
        //noMatchFilter()
        this.options.noMatchFilter = noParamText;
        return this;
    };
    breakMatchFilters = function (filter) {
        //breakMatchFilters()
        const logger = new log_1.default('BreakMatchFilters', this.debug);
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
    noBreakMatchFilters = function () {
        //noBreakMatchFilters()
        this.options.noBreakMatchFilters = noParamText;
        return this;
    };
    noPlaylist = function () {
        //noPlaylist()
        this.options.noPlaylist = noParamText;
        return this;
    };
    yesPlaylist = function () {
        //yesPlaylist()
        this.options.yesPlaylist = noParamText;
        return this;
    };
    ageLimit = function (years) {
        //ageLimit()
        const logger = new log_1.default('AgeLimit', this.debug);
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
    downloadArchive = function (file) {
        //downloadArchive()
        const logger = new log_1.default('DownloadArchive', this.debug);
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
    noDownloadArchive = function () {
        //noDownloadArchive()
        this.options.noDownloadArchive = noParamText;
        return this;
    };
    breakOnExisting = function () {
        //breakOnExisting()
        this.options.breakOnExisting = noParamText;
        return this;
    };
    breakPerInput = function () {
        //breakPerInput()
        this.options.breakPerInput = noParamText;
        return this;
    };
    noBreakPerInput = function () {
        //noBreakPerInput()
        this.options.noBreakPerInput = noParamText;
        return this;
    };
    skipPlaylistAfterErrors = function (limit) {
        //skipPlaylistAfterErrors()
        const logger = new log_1.default('SkipPlaylistAfterErrors', this.debug);
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
    concurrentFragments = function (number) {
        //concurrentFragments()
        const logger = new log_1.default('ConcurrentFragments', this.debug);
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
    limitRate = function (rate) {
        //limitRate()
        const logger = new log_1.default('LimitRate', this.debug);
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
    throttledRate = function (rate) {
        //throttledRate()
        const logger = new log_1.default('ThrottledRate', this.debug);
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
    retries = function (retries) {
        //retries()
        const logger = new log_1.default('Retries', this.debug);
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
    fileAccessRetries = function (retries) {
        //fileAccessRetries()
        const logger = new log_1.default('FileAccessRetries', this.debug);
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
    fragmentRetries = function (retries) {
        //fragmentRetries()
        const logger = new log_1.default('FragmentRetries', this.debug);
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
    retrySleep = function (seconds) {
        //retrySleep()
        const logger = new log_1.default('RetrySleep', this.debug);
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
    noAbortOnUnavailableFragments = function () {
        //noAbortOnUnavailableFragments()
        this.options.noAbortOnUnavailableFragments = noParamText;
        return this;
    };
    skipUnavailableFragments = function () {
        //skipUnavailableFragments()
        this.options.skipUnavailableFragments = noParamText;
        return this;
    };
    abortOnUnavailableFragments = function () {
        //abortOnUnavailableFragments()
        this.options.abortOnUnavailableFragments = noParamText;
        return this;
    };
    noSkipUnavailableFragments = function () {
        //noSkipUnavailableFragments()
        this.options.noSkipUnavailableFragments = noParamText;
        return this;
    };
    keepFragments = function () {
        //keepFragments()
        this.options.keepFragments = noParamText;
        return this;
    };
    noKeepFragments = function () {
        //noKeepFragments()
        this.options.noKeepFragments = noParamText;
        return this;
    };
    bufferSize = function (size) {
        //bufferSize()
        const logger = new log_1.default('BufferSize', this.debug);
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
    resizeBuffer = function () {
        //resizeBuffer()
        this.options.resizeBuffer = noParamText;
        return this;
    };
    noResizeBuffer = function () {
        //noResizeBuffer()
        this.options.noResizeBuffer = noParamText;
        return this;
    };
    httpChunkSize = function (size) {
        //httpChunkSize()
        const logger = new log_1.default('HttpChunkSize', this.debug);
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
    playlistRandom = function () {
        //playlistRandom()
        this.options.playlistRandom = noParamText;
        return this;
    };
    lazyPlaylist = function () {
        //lazyPlaylist()
        this.options.lazyPlaylist = noParamText;
        return this;
    };
    noLazyPlaylist = function () {
        //noLazyPlaylist()
        this.options.noLazyPlaylist = noParamText;
        return this;
    };
    xattrSetFileSize = function () {
        //xattrSetFileSize()
        this.options.xattrSetFileSize = noParamText;
        return this;
    };
    hlsUseMpegts = function () {
        //hlsUseMpegts()
        this.options.hlsUseMpegts = noParamText;
        return this;
    };
    noHlsUseMpegts = function () {
        //noHlsUseMpegts()
        this.options.noHlsUseMpegts = noParamText;
        return this;
    };
    downloadSections = function (regex) {
        //downloadSections()
        const logger = new log_1.default('DownloadSections', this.debug);
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
    downloader = function (downloader) {
        //downloader()
        const logger = new log_1.default('Downloader', this.debug);
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
    externalDownloader = function (downloader) {
        //externalDownloader()
        const logger = new log_1.default('ExternalDownloader', this.debug);
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
    downloaderArgs = function (args) {
        //downloaderArgs()
        const logger = new log_1.default('DownloaderArgs', this.debug);
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
    externalDownloaderArgs = function (args) {
        //externalDownloaderArgs()
        const logger = new log_1.default('ExternalDownloaderArgs', this.debug);
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
    batchFile = function (file) {
        //batchFile()
        const logger = new log_1.default('BatchFile', this.debug);
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
    noBatchFile = function () {
        //noBatchFile()
        this.options.noBatchFile = noParamText;
        return this;
    };
    paths = function (path) {
        //paths()
        const logger = new log_1.default('Paths', this.debug);
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
    output = function (template) {
        //output()
        const logger = new log_1.default('Output', this.debug);
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
    outputNaPlaceholder = function (text) {
        //outputNaPlaceholder()
        const logger = new log_1.default('OutputNaPlaceholder', this.debug);
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
    restrictFilenames = function () {
        //restrictFilenames()
        this.options.restrictFilenames = noParamText;
        return this;
    };
    noRestrictFilenames = function () {
        //noRestrictFilenames()
        this.options.noRestrictFilenames = noParamText;
        return this;
    };
    windowsFilenames = function () {
        //windowsFilenames()
        this.options.windowsFilenames = noParamText;
        return this;
    };
    noWindowsFilenames = function () {
        //noWindowsFilenames()
        this.options.noWindowsFilenames = noParamText;
        return this;
    };
    trimFilenames = function (length) {
        //trimFilenames()
        const logger = new log_1.default('TrimFilenames', this.debug);
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
    noOverwrites = function () {
        //noOverwrites()
        this.options.noOverwrites = noParamText;
        return this;
    };
    forceOverwrites = function () {
        //forceOverwrites()
        this.options.forceOverwrites = noParamText;
        return this;
    };
    noForceOverwrites = function () {
        //noForceOverwrites()
        this.options.noForceOverwrites = noParamText;
        return this;
    };
    continue = function () {
        //continue()
        this.options.continue = noParamText;
        return this;
    };
    noContinue = function () {
        //noContinue()
        this.options.noContinue = noParamText;
        return this;
    };
    part = function () {
        //part()
        this.options.part = noParamText;
        return this;
    };
    noPart = function () {
        //noPart()
        this.options.noPart = noParamText;
        return this;
    };
    mtime = function () {
        //mtime()
        this.options.mtime = noParamText;
        return this;
    };
    noMtime = function () {
        //noMtime()
        this.options.noMtime = noParamText;
        return this;
    };
    writeDescription = function () {
        //writeDescription()
        this.options.writeDescription = noParamText;
        return this;
    };
    noWriteDescription = function () {
        //noWriteDescription()
        this.options.noWriteDescription = noParamText;
        return this;
    };
    writeInfoJson = function () {
        //writeInfoJson()
        this.options.writeInfoJson = noParamText;
        return this;
    };
    noWriteInfoJson = function () {
        //noWriteInfoJson()
        this.options.noWriteInfoJson = noParamText;
        return this;
    };
    cleanInfoJson = function () {
        //cleanInfoJson()
        this.options.cleanInfoJson = noParamText;
        return this;
    };
    noCleanInfoJson = function () {
        //noCleanInfoJson()
        this.options.noCleanInfoJson = noParamText;
        return this;
    };
    writePlaylistMetafiles = function () {
        //writePlaylistMetafiles()
        this.options.writePlaylistMetafiles = noParamText;
        return this;
    };
    noWritePlaylistMetafiles = function () {
        //noWritePlaylistMetafiles()
        this.options.noWritePlaylistMetafiles = noParamText;
        return this;
    };
    writeComments = function () {
        //writeComments()
        this.options.writeComments = noParamText;
        return this;
    };
    getComments = function () {
        //getComments()
        this.options.getComments = noParamText;
        return this;
    };
    noWriteComments = function () {
        //noWriteComments()
        this.options.noWriteComments = noParamText;
        return this;
    };
    noGetComments = function () {
        //noGetComments()
        this.options.noGetComments = noParamText;
        return this;
    };
    loadInfoJson = function (file) {
        //loadInfoJson()
        const logger = new log_1.default('LoadInfoJson', this.debug);
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
    cookies = function (file) {
        //cookies()
        const logger = new log_1.default('Cookies', this.debug);
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
    noCookies = function () {
        //noCookies()
        this.options.noCookies = noParamText;
        return this;
    };
    cookiesFromBrowser = function (browser) {
        //cookiesFromBrowser()
        const logger = new log_1.default('CookiesFromBrowser', this.debug);
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
    noCookiesFromBrowser = function () {
        //noCookiesFromBrowser()
        this.options.noCookiesFromBrowser = noParamText;
        return this;
    };
    cacheDir = function (dir) {
        //cacheDir()
        const logger = new log_1.default('CacheDir', this.debug);
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
    noCacheDir = function () {
        //noCacheDir()
        this.options.noCacheDir = noParamText;
        return this;
    };
    rmCacheDir = function () {
        //rmCacheDir()
        this.options.rmCacheDir = noParamText;
        return this;
    };
    /* サムネイルオプション */
    writeThumbnail = function () {
        //writeThumbnail()
        this.options.writeThumbnail = noParamText;
        return this;
    };
    writeAllThumbnails = function () {
        //writeAllThumbnails()
        this.options.writeAllThumbnails = noParamText;
        return this;
    };
    noWriteThumbnail = function () {
        //noWriteThumbnail()
        this.options.noWriteThumbnail = noParamText;
        return this;
    };
    listThumbnails = function () {
        //listThumbnails()
        this.options.listThumbnails = noParamText;
        return this;
    };
    /* インターネットショートカットオプション */
    writeLink = function () {
        //writeLink()
        this.options.writeLink = noParamText;
        return this;
    };
    writeUrlLink = function () {
        //writeUrlLink()
        this.options.writeUrlLink = noParamText;
        return this;
    };
    writeWeblocLink = function () {
        //writeWeblocLink()
        this.options.writeWeblocLink = noParamText;
        return this;
    };
    writeDesktopLink = function () {
        //writeDesktopLink()
        this.options.writeDesktopLink = noParamText;
        return this;
    };
    /* 冗長性・シュミレートオプション */
    quiet = function () {
        //quiet()
        this.options.quiet = noParamText;
        return this;
    };
    noWarnings = function () {
        //noWarnings()
        this.options.noWarnings = noParamText;
        return this;
    };
    simulate = function () {
        //simulate()
        this.options.simulate = noParamText;
        return this;
    };
    noSimulate = function () {
        //noSimulate()
        this.options.noSimulate = noParamText;
        return this;
    };
    ignoreNoFormatsError = function () {
        //ignoreNoFormatsError()
        this.options.ignoreNoFormatsError = noParamText;
        return this;
    };
    noIgnoreNoFormatsError = function () {
        //noIgnoreNoFormatsError()
        this.options.noIgnoreNoFormatsError = noParamText;
        return this;
    };
    skipDownload = function () {
        //skipDownload()
        this.options.skipDownload = noParamText;
        return this;
    };
    noDownload = function () {
        //noDownload()
        this.options.noDownload = noParamText;
        return this;
    };
    print = function (template) {
        //print()
        const logger = new log_1.default('Print', this.debug);
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
    printToFile = function (templateFile) {
        //printToFile()
        const logger = new log_1.default('PrintToFile', this.debug);
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
    dumpJson = function () {
        //dumpJson()
        this.options.dumpJson = noParamText;
        return this;
    };
    dumpSingleJson = function () {
        //dumpSingleJson()
        this.options.dumpSingleJson = noParamText;
        return this;
    };
    forceWriteArchive = function () {
        //forceWriteArchive()
        this.options.forceWriteArchive = noParamText;
        return this;
    };
    forceDownloadArchive = function () {
        //forceDownloadArchive()
        this.options.forceDownloadArchive = noParamText;
        return this;
    };
    newline = function () {
        //newline()
        this.options.newline = noParamText;
        return this;
    };
    noProgress = function () {
        //noProgress()
        this.options.noProgress = noParamText;
        return this;
    };
    progress = function () {
        //progress()
        this.options.progress = noParamText;
        return this;
    };
    consoleTitle = function () {
        //consoleTitle()
        this.options.consoleTitle = noParamText;
        return this;
    };
    progressTemplate = function (template) {
        //progressTemplate()
        const logger = new log_1.default('ProgressTemplate', this.debug);
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
    verbose = function () {
        //verbose()
        this.options.verbose = noParamText;
        return this;
    };
    dumpPages = function () {
        //dumpPages()
        this.options.dumpPages = noParamText;
        return this;
    };
    writePages = function () {
        //writePages()
        this.options.writePages = noParamText;
        return this;
    };
    printTraffic = function () {
        //printTraffic()
        this.options.printTraffic = noParamText;
        return this;
    };
    /* 回避オプション */
    encoding = function (encoding) {
        //encoding()
        const logger = new log_1.default('Encoding', this.debug);
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
    legacyServerConnect = function () {
        //legacyServerConnect()
        this.options.legacyServerConnect = noParamText;
        return this;
    };
    noCheckCertificates = function () {
        //noCheckCertificates()
        this.options.noCheckCertificates = noParamText;
        return this;
    };
    preferInsecure = function () {
        //preferInsecure()
        this.options.preferInsecure = noParamText;
        return this;
    };
    addHeaders = function (headers) {
        //addHeaders()
        const logger = new log_1.default('AddHeaders', this.debug);
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
    bidiWorkaround = function () {
        //bidiWorkaround()
        this.options.bidiWorkaround = noParamText;
        return this;
    };
    sleepRequests = function (seconds) {
        //sleepRequests()
        const logger = new log_1.default('SleepRequests', this.debug);
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
    sleepInterval = function (interval) {
        //sleepInterval()
        const logger = new log_1.default('SleepInterval', this.debug);
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
    minSleepInterval = function (interval) {
        //minSleepInterval()
        const logger = new log_1.default('MinSleepInterval', this.debug);
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
    maxSleepInterval = function (interval) {
        //maxSleepInterval()
        const logger = new log_1.default('MaxSleepInterval', this.debug);
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
    sleepSubtitles = function (interval) {
        //sleepSubtitles()
        const logger = new log_1.default('SleepSubtitles', this.debug);
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
    format = function (format) {
        //format()
        const logger = new log_1.default('Format', this.debug);
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
    formatSort = function (sort) {
        //formatSort()
        const logger = new log_1.default('FormatSort', this.debug);
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
    formatSortForce = function () {
        //formatSortForce()
        this.options.formatSortForce = noParamText;
        return this;
    };
    SForce = function () {
        //SForce()
        this.options.SForce = noParamText;
        return this;
    };
    noFormatSortForce = function () {
        //noFormatSortForce()
        this.options.noFormatSortForce = noParamText;
        return this;
    };
    videoMultiStreams = function () {
        //videoMultiStreams()
        this.options.videoMultiStreams = noParamText;
        return this;
    };
    noVideoMultiStreams = function () {
        //noVideoMultiStreams()
        this.options.noVideoMultiStreams = noParamText;
        return this;
    };
    audioMultiStreams = function () {
        //audioMultiStreams()
        this.options.audioMultiStreams = noParamText;
        return this;
    };
    noAudioMultiStreams = function () {
        //noAudioMultiStreams()
        this.options.noAudioMultiStreams = noParamText;
        return this;
    };
    preferFreeFormats = function () {
        //preferFreeFormats()
        this.options.preferFreeFormats = noParamText;
        return this;
    };
    noPreferFreeFormats = function () {
        //noPreferFreeFormats()
        this.options.noPreferFreeFormats = noParamText;
        return this;
    };
    checkFormats = function () {
        //checkFormats()
        this.options.checkFormats = noParamText;
        return this;
    };
    checkAllFormats = function () {
        //checkAllFormats()
        this.options.checkAllFormats = noParamText;
        return this;
    };
    noCheckFormats = function () {
        //noCheckFormats()
        this.options.noCheckFormats = noParamText;
        return this;
    };
    listFormats = function () {
        //listFormats()
        this.options.listFormats = noParamText;
        return this;
    };
    mergeOutputFormat = function (format) {
        //mergeOutputFormat()
        const logger = new log_1.default('MergeOutputFormat', this.debug);
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
    writeSubs = function () {
        //writeSubs()
        this.options.writeSubs = noParamText;
        return this;
    };
    noWriteSubs = function () {
        //noWriteSubs()
        this.options.noWriteSubs = noParamText;
        return this;
    };
    writeAutoSubs = function () {
        //writeAutoSubs()
        this.options.writeAutoSubs = noParamText;
        return this;
    };
    writeAutomaticSubs = function () {
        //writeAutomaticSubs()
        this.options.writeAutomaticSubs = noParamText;
        return this;
    };
    noWriteAutoSubs = function () {
        //noWriteAutoSubs()
        this.options.noWriteAutoSubs = noParamText;
        return this;
    };
    noWriteAutomaticSubs = function () {
        //noWriteAutomaticSubs()
        this.options.noWriteAutomaticSubs = noParamText;
        return this;
    };
    listSubs = function () {
        //listSubs()
        this.options.listSubs = noParamText;
        return this;
    };
    subFormat = function (format) {
        //subFormat()
        const logger = new log_1.default('SubFormat', this.debug);
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
    subLangs = function (regex) {
        //subLangs()
        const logger = new log_1.default('SubLangs', this.debug);
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
    username = function (username) {
        //username()
        const logger = new log_1.default('Username', this.debug);
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
    password = function (password) {
        //password()
        const logger = new log_1.default('Password', this.debug);
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
    twofactor = function (code) {
        //twofactor()
        const logger = new log_1.default('Twofactor', this.debug);
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
    netrc = function () {
        //netrc()
        this.options.netrc = noParamText;
        return this;
    };
    netrcLocation = function (path) {
        //netrcLocation()
        const logger = new log_1.default('NetrcLocation', this.debug);
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
    videoPassword = function (password) {
        //videoPassword()
        const logger = new log_1.default('VideoPassword', this.debug);
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
    apMso = function (mso) {
        //apMso()
        const logger = new log_1.default('ApMso', this.debug);
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
    apUsername = function (username) {
        //apUsername()
        const logger = new log_1.default('ApUsername', this.debug);
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
    apPassword = function (password) {
        //apPassword()
        const logger = new log_1.default('ApPassword', this.debug);
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
    apListMso = function () {
        //apListMso()
        this.options.apListMso = noParamText;
        return this;
    };
    clientCertificate = function (path) {
        //clientCertificate()
        const logger = new log_1.default('ClientCertificate', this.debug);
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
    clientCertificateKey = function (path) {
        //clientCertificateKey()
        const logger = new log_1.default('ClientCertificateKey', this.debug);
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
    clientCertificatePassword = function (password) {
        //clientCertificatePassword()
        const logger = new log_1.default('ClientCertificatePassword', this.debug);
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
    extractAudio = function () {
        //extractAudio()
        this.options.extractAudio = noParamText;
        return this;
    };
    audioFormat = function (format) {
        //audioFormat()
        const logger = new log_1.default('AudioFormat', this.debug);
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
    audioQuality = function (quality) {
        //audioQuality()
        const logger = new log_1.default('AudioQuality', this.debug);
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
    remuxVideo = function (format) {
        //remuxVideo()
        const logger = new log_1.default('RemuxVideo', this.debug);
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
    recodeVideo = function (format) {
        //recodeVideo()
        const logger = new log_1.default('RecodeVideo', this.debug);
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
    postProcessorArgs = function (args) {
        //postProcessorArgs()
        const logger = new log_1.default('PostProcessorArgs', this.debug);
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
    ppa = function (args) {
        //ppa()
        const logger = new log_1.default('Ppa', this.debug);
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
    keepVideo = function () {
        //keepVideo()
        this.options.keepVideo = noParamText;
        return this;
    };
    noKeepVideo = function () {
        //noKeepVideo()
        this.options.noKeepVideo = noParamText;
        return this;
    };
    postOverwrites = function () {
        //postOverwrites()
        this.options.postOverwrites = noParamText;
        return this;
    };
    noPostOverwrites = function () {
        //noPostOverwrites()
        this.options.noPostOverwrites = noParamText;
        return this;
    };
    embedSubs = function () {
        //embedSubs()
        this.options.embedSubs = noParamText;
        return this;
    };
    noEmbedSubs = function () {
        //noEmbedSubs()
        this.options.noEmbedSubs = noParamText;
        return this;
    };
    embedThumbnail = function () {
        //embedThumbnail()
        this.options.embedThumbnail = noParamText;
        return this;
    };
    noEmbedThumbnail = function () {
        //noEmbedThumbnail()
        this.options.noEmbedThumbnail = noParamText;
        return this;
    };
    embedMetadata = function () {
        //embedMetadata()
        this.options.embedMetadata = noParamText;
        return this;
    };
    addMetadata = function () {
        //addMetadata()
        this.options.addMetadata = noParamText;
        return this;
    };
    noEmbedMetadata = function () {
        //noEmbedMetadata()
        this.options.noEmbedMetadata = noParamText;
        return this;
    };
    noAddMetadata = function () {
        //noAddMetadata()
        this.options.noAddMetadata = noParamText;
        return this;
    };
    embedChapters = function () {
        //embedChapters()
        this.options.embedChapters = noParamText;
        return this;
    };
    addChapters = function () {
        //addChapters()
        this.options.addChapters = noParamText;
        return this;
    };
    noEmbedChapters = function () {
        //noEmbedChapters()
        this.options.noEmbedChapters = noParamText;
        return this;
    };
    noAddChapters = function () {
        //noAddChapters()
        this.options.noAddChapters = noParamText;
        return this;
    };
    embedInfoJson = function () {
        //embedInfoJson()
        this.options.embedInfoJson = noParamText;
        return this;
    };
    noEmbedInfoJson = function () {
        //noEmbedInfoJson()
        this.options.noEmbedInfoJson = noParamText;
        return this;
    };
    parseMetadata = function (fromTo) {
        //parseMetadata()
        const logger = new log_1.default('ParseMetadata', this.debug);
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
    replaceInMetadata = function (fields) {
        //replaceInMetadata()
        const logger = new log_1.default('ReplaceInMetadata', this.debug);
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
    xattrs = function () {
        //xattrs()
        this.options.xattrs = noParamText;
        return this;
    };
    concatPlaylist = function (policy) {
        //concatPlaylist()
        const logger = new log_1.default('ConcatPlaylist', this.debug);
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
    fixup = function (policy) {
        //fixup()
        const logger = new log_1.default('Fixup', this.debug);
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
    ffmpegLocation = function (path) {
        //ffmpegLocation()
        const logger = new log_1.default('FfmpegLocation', this.debug);
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
    exec = function (cmd) {
        //exec()
        const logger = new log_1.default('Exec', this.debug);
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
    noExec = function () {
        //noExec()
        this.options.noExec = noParamText;
        return this;
    };
    convertSubs = function (format) {
        //convertSubs()
        const logger = new log_1.default('ConvertSubs', this.debug);
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
    convertSubtitles = function (format) {
        //convertSubtitles()
        const logger = new log_1.default('ConvertSubtitles', this.debug);
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
    convertThumbnails = function (format) {
        //convertThumbnails()
        const logger = new log_1.default('ConvertThumbnails', this.debug);
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
    splitChapters = function () {
        //splitChapters()
        this.options.splitChapters = noParamText;
        return this;
    };
    noSplitChapters = function () {
        //noSplitChapters()
        this.options.noSplitChapters = noParamText;
        return this;
    };
    removeChapters = function (regex) {
        //removeChapters()
        const logger = new log_1.default('RemoveChapters', this.debug);
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
    noRemoveChapters = function () {
        //noRemoveChapters()
        this.options.noRemoveChapters = noParamText;
        return this;
    };
    forceKeyframesAtCuts = function () {
        //forceKeyframesAtCuts()
        this.options.forceKeyframesAtCuts = noParamText;
        return this;
    };
    noForceKeyframesAtCuts = function () {
        //noForceKeyframesAtCuts()
        this.options.noForceKeyframesAtCuts = noParamText;
        return this;
    };
    usePostProcessor = function (postProcessor) {
        //usePostProcessor()
        const logger = new log_1.default('UsePostProcessor', this.debug);
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
    sponsorBlockMark = function (cats) {
        //sponsorBlockMark()
        const logger = new log_1.default('SponsorBlockMark', this.debug);
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
    sponsorBlockRemove = function (cats) {
        //sponsorBlockRemove()
        const logger = new log_1.default('SponsorBlockRemove', this.debug);
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
    sponsorBlockChapterTitle = function (template) {
        //sponsorBlockChapterTitle()
        const logger = new log_1.default('SponsorBlockChapterTitle', this.debug);
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
    noSponsorBlock = function () {
        //noSponsorBlock()
        this.options.noSponsorBlock = noParamText;
        return this;
    };
    sponsorBlockApi = function () {
        //sponsorBlockApi()
        this.options.sponsorBlockApi = noParamText;
        return this;
    };
    /* Extractor オプション */
    extractorRetries = function (retries) {
        //extractorRetries()
        const logger = new log_1.default('ExtractorRetries', this.debug);
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
    allowDynamicMpd = function () {
        //allowDynamicMpd()
        this.options.allowDynamicMpd = noParamText;
        return this;
    };
    noIgnoreDynamicMpd = function () {
        //noIgnoreDynamicMpd()
        this.options.noIgnoreDynamicMpd = noParamText;
        return this;
    };
    ignoreDynamicMpd = function () {
        //ignoreDynamicMpd()
        this.options.ignoreDynamicMpd = noParamText;
        return this;
    };
    noAllowDynamicMpd = function () {
        //noAllowDynamicMpd()
        this.options.noAllowDynamicMpd = noParamText;
        return this;
    };
    hlsSplitDiscontinuity = function () {
        //hlsSplitDiscontinuity()
        this.options.hlsSplitDiscontinuity = noParamText;
        return this;
    };
    noHlsSplitDiscontinuity = function () {
        //noHlsSplitDiscontinuity()
        this.options.noHlsSplitDiscontinuity = noParamText;
        return this;
    };
    extractorArgs = function (args) {
        //extractorArgs()
        const logger = new log_1.default('ExtractorArgs', this.debug);
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
(0, update_notifier_1.default)({ pkg: { name: 'node-fluent-ytdlp', version: '1.2.1' }, updateCheckInterval: 1000 }).notify({
    message: '更新情報: ' + chalk_1.default.yellow('{currentVersion}') + chalk_1.default.reset(' → ') + chalk_1.default.green('{latestVersion}') + '\n更新方法: ' + chalk_1.default.cyan('{updateCommand}'),
    boxenOptions: { padding: 1, margin: 1, align: 'left', borderColor: 'blue', borderStyle: 'round', title: '更新に関する通知', titleAlignment: 'center' },
});
module.exports = fluentYTDlp;

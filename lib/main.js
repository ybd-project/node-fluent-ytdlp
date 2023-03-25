/**
 * Fluent-ytdlp - Copyright © 2023 YBD Project - MIT License
 */
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const node_child_process_1 = require("node:child_process");
const node_fs_1 = __importDefault(require("node:fs"));
const log_1 = __importDefault(require("./functions/log"));
const option_1 = __importDefault(require("./functions/option"));
const { binaryPath, os } = JSON.parse(node_fs_1.default.readFileSync(process.cwd() + '/bin/info.json', 'utf8'));
//yt-dlpのオプションを生成する
function generateOption({ debug, wrongOption, options }, runOptions) {
    const logger = new log_1.default('generateOption', debug), exception = ['url', 'width', 'height', 'filename', 'extension'];
    return Object.entries(options).reduce((previous, [name, param]) => {
        if (exception.includes(name)) {
            if (name === 'url') {
                if (os.platform !== 'windows') {
                    param = param.toString().replace('"', '');
                }
                previous.push(param);
            }
            else if (name === 'width' || name === 'height') {
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
            if (wrongOption.includes(name)) {
                if (runOptions.force !== true) {
                    logger.warning('[' + name + ']: このオプションは間違った引数が指定されている可能性があるため適応されませんでした。');
                    return previous;
                }
                logger.warning('[' + name + ']: このオプションは間違った引数が指定されている可能性がありますが、設定により強制的に適応されます。');
            }
            if (!previous.includes(option_1.default.decode(name))) {
                previous.push('--' + option_1.default.decode(name));
                previous.push(param);
            }
            else {
                previous.push('--' + option_1.default.decode(name));
                if (param !== 'Option with no parameters.') {
                    previous.push(param);
                }
            }
        }
        return previous;
    }, []);
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
        }
        this.options.url = url;
    }
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
        return ytdlpProcess;
    };
    /* 簡易オプション */
    resolution = function (resolution) {
        const logger = new log_1.default('Resolution', this.debug), [width, height] = resolution.split('x');
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
    width = function (_width) {
        const logger = new log_1.default('Width', this.debug), width = _width.toString();
        //_widthが数字か、型がstringまたはnumberかをチェックする
        if (isNaN(+width) || ['string', 'number'].includes(typeof _width)) {
            logger.warning('このオプションに指定された値は数字ではないか、型が「String」または「Number」ではない可能性があります。');
            this.wrongOption.push('width');
        }
        this.options.width = width;
        return this;
    };
    height = function (_height) {
        const logger = new log_1.default('Height', this.debug), height = _height.toString();
        //_heightが数字か、型がstringまたはnumberかをチェックする
        if (isNaN(+height) || ['string', 'number'].includes(typeof _height) || !_height) {
            logger.warning('このオプションに指定された値は数字ではないか、型が「String」または「Number」ではない可能性があります。');
            this.wrongOption.push('height');
        }
        this.options.height = height;
        return this;
    };
    filename = function (filename) {
        const logger = new log_1.default('Filename', this.debug);
        //型がstringかをチェックする
        if (typeof filename !== 'string' || !filename) {
            logger.warning('このオプションに指定された値は型が「String」ではない可能性があります。');
            this.wrongOption.push('filename');
        }
        this.options.filename = filename;
        return this;
    };
    extension = function (extension) {
        const logger = new log_1.default('Extension', this.debug);
        //型がstringかをチェックする
        if (typeof extension !== 'string' || !extension) {
            logger.warning('このオプションに指定された値は型が「String」ではない可能性があります。');
            this.wrongOption.push('extension');
        }
        this.options.extension = extension;
        return this;
    };
    /* その他のオプション */
    url = function (url) {
        const logger = new log_1.default('Url', this.debug);
        if (typeof url !== 'string' || !url) {
            logger.warning('このオプションの引数の型が「String」ではない可能性があります。');
        }
        this.options.url = url;
        return this;
    };
    otherOptions = function (otherOptions) {
        const logger = new log_1.default('OtherOptions', this.debug);
        if (typeof otherOptions !== 'object' || !otherOptions) {
            logger.warning('このオプションの引数の型が「Object」ではない可能性があります。');
        }
        Object.entries(otherOptions).forEach(([key, param]) => {
            this.options[key] = param;
        });
        return this;
    };
    _ytdlpPath = function () {
        return binaryPath.ytdlp;
    };
    _ffmpegPath = function () {
        return binaryPath.ffmpeg;
    };
    _ffprobePath = function () {
        return binaryPath.ffprobe;
    };
    _binPath = function () {
        return binaryPath.folder;
    };
}
module.exports = fluentYTDlp;

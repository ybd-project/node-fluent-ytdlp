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
const { binaryPath, os } = JSON.parse(node_fs_1.default.readFileSync(process.cwd() + '/lib/info.json', 'utf8'));
function generateOption({ options, wrongOption, debug }, runOptions) {
    const logger = new log_1.default('generateOption', debug), exception = ['url'];
    return Object.entries(options).reduce((previous, [name, param]) => {
        if (exception.includes(name)) {
            if (name === 'url' && os.platform !== 'windows') {
                param = param.toString().replace('"', '');
            }
            previous.push(param);
        }
        else {
            if (wrongOption.includes(name)) {
                if (runOptions.force !== true) {
                    logger.warning('[' + name + ']: このオプションは間違った引数が指定されている可能性があるため適応されませんでした。');
                    return previous;
                }
                logger.warning('[' + name + ']: このオプションは間違った引数が指定されている可能性がありますが、設定により強制的に適応されます。');
            }
            previous.push('--' + option_1.default.decode(name));
            previous.push(param);
        }
        return previous;
    }, []);
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
    noStreamRun = function (runOptions = { type: 'execFile', callback: function () { }, force: false }) {
        //noStreamRun()
        const logger = new log_1.default('noStream', this.debug), options = generateOption(this, runOptions);
        if (!runOptions.type) {
            logger.warning('実行形式が指定されませんでした。');
        }
        if (!runOptions.callback) {
            logger.warning('コールバック関数が指定されませんでした。');
        }
        if (runOptions.type === 'exec') {
            return (0, node_child_process_1.exec)([binaryPath.ytdlp, ...options].join(' '), runOptions.callback);
        }
        else {
            return (0, node_child_process_1.execFile)(binaryPath.ytdlp, options, runOptions.callback);
        }
    };
    run = function (runOptions = {}) {
        //run()
        const logger = new log_1.default('Run', this.debug), options = generateOption(this, runOptions);
        logger.log('OK');
        return (0, node_child_process_1.spawn)(binaryPath.ytdlp, options, runOptions.spawnOptions || { shell: true });
    };
}
module.exports = fluentYTDlp;

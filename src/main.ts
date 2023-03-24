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

const {binaryPath, os} = JSON.parse(fs.readFileSync(process.cwd() + '/lib/info.json', 'utf8'));

function generateOption({options, wrongOption, debug}: fluentYTDlp, runOptions: RunOptions | NoStreamRunOptions): Array<any> {
    const logger = new Log('generateOption', debug),
        exception = ['url'];
    return Object.entries(options).reduce<any>((previous, [name, param]) => {
        if (exception.includes(name)) {
            if (name === 'url' && os.platform !== 'windows') {
                param = param.toString().replace('"', '');
            }
            previous.push(param);
        } else {
            if (wrongOption.includes(name)) {
                if (runOptions.force !== true) {
                    logger.warning('[' + name + ']: このオプションは間違った引数が指定されている可能性があるため適応されませんでした。');
                    return previous;
                }
                logger.warning('[' + name + ']: このオプションは間違った引数が指定されている可能性がありますが、設定により強制的に適応されます。');
            }
            previous.push('--' + option.decode(name));
            previous.push(param);
        }
        return previous;
    }, []);
}

class fluentYTDlp {
    options: YTDlpOptionsData = {};
    wrongOption: Array<string> = [];
    debug = false;
    constructor(url: string, debug: boolean = false) {
        //new FluentYTDlp('URL');
        this.debug = debug;
        const logger = new Log('Constructor', this.debug);
        if (!url) {
            logger.warning('インスタンス生成時にURLは指定されませんでした。');
        }
        this.options.url = url;
    }
    noStreamRun = function (this: fluentYTDlp, runOptions: NoStreamRunOptions = {type: 'execFile', callback: function () {}, force: false}): ChildProcess {
        //noStreamRun()

        const logger = new Log('noStream', this.debug),
            options = generateOption(this, runOptions);

        if (!runOptions.type) {
            logger.warning('実行形式が指定されませんでした。');
        }
        if (!runOptions.callback) {
            logger.warning('コールバック関数が指定されませんでした。');
        }

        if (runOptions.type === 'exec') {
            return exec([binaryPath.ytdlp, ...options].join(' '), runOptions.callback);
        } else {
            return execFile(binaryPath.ytdlp, options, runOptions.callback);
        }
    };
    run = function (this: fluentYTDlp, runOptions: RunOptions = {}): ChildProcessWithoutNullStreams {
        //run()

        const logger = new Log('Run', this.debug),
            options = generateOption(this, runOptions);

        logger.log('OK');

        return spawn(binaryPath.ytdlp, options, runOptions.spawnOptions || {shell: true});
    };
}

export = fluentYTDlp;

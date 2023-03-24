/**
 * Fluent-ytdlp - Copyright © 2023 YBD Project - MIT License
 */
/// <reference types="node" />
type YTDlpOptionsData = {
    [key: string]: string | number | boolean | RegExp | Date | object;
};
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
import { ChildProcessWithoutNullStreams, ChildProcess } from 'node:child_process';
declare class fluentYTDlp {
    options: YTDlpOptionsData;
    wrongOption: Array<string>;
    debug: boolean;
    constructor(url: string, debug?: boolean);
    noStreamRun: (this: fluentYTDlp, runOptions?: NoStreamRunOptions) => ChildProcess;
    run: (this: fluentYTDlp, runOptions?: RunOptions) => ChildProcessWithoutNullStreams;
}
export = fluentYTDlp;

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
    private options;
    private wrongOption;
    private debug;
    constructor(url: string, debug?: boolean);
    run: (this: fluentYTDlp, runOptions?: RunOptions) => ChildProcessWithoutNullStreams;
    noStreamRun: (this: fluentYTDlp, runOptions?: NoStreamRunOptions) => ChildProcess;
    resolution: (this: fluentYTDlp, resolution: string) => fluentYTDlp;
    width: (this: fluentYTDlp, _width: string | number) => fluentYTDlp;
    height: (this: fluentYTDlp, _height: string | number) => fluentYTDlp;
    filename: (this: fluentYTDlp, filename: string) => fluentYTDlp;
    extension: (this: fluentYTDlp, extension: string) => fluentYTDlp;
    url: (this: fluentYTDlp, url: string) => fluentYTDlp;
    otherOptions: (this: fluentYTDlp, otherOptions: YTDlpOptionsData) => fluentYTDlp;
    _ytdlpPath: () => string;
    _ffmpegPath: () => string;
    _ffprobePath: () => string;
    _binPath: () => string;
}
export = fluentYTDlp;
//# sourceMappingURL=main.d.ts.map
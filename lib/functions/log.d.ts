declare class Log {
    display: boolean;
    option: string;
    constructor(option: string, test?: boolean);
    log: (this: {
        option: string;
        display: boolean;
    }, text: any) => void;
    success: (this: {
        option: string;
        display: boolean;
    }, text: any) => void;
    warning: (this: {
        option: string;
        display: boolean;
    }, text: any) => void;
    error: (this: {
        option: string;
        display: boolean;
    }, text: any) => void;
}
export default Log;
//# sourceMappingURL=log.d.ts.map
'use strict';

const logColor = {
    DEBUG: '36',
    SUCCESS: '32',
    WARNING: '33',
    ERROR: '31',
};

function createLog(option: string, type: 'DEBUG' | 'SUCCESS' | 'WARNING' | 'ERROR'): string {
    return '\u001b[' + logColor[type] + 'm[' + type + ' : ' + option + ']:\u001b[0m';
}

class Log {
    display = false;
    option = '';

    constructor(option: string, test: boolean = false) {
        this.display = test || false;
        this.option = option;
    }

    log = function (this: {option: string; display: boolean}, text: any): void {
        if (this.display === true) {
            console.log(createLog(this.option, 'DEBUG'), text);
        }
        return;
    };

    success = function (this: {option: string; display: boolean}, text: any): void {
        if (this.display === true) {
            console.log(createLog(this.option, 'SUCCESS'), text);
        }
        return;
    };

    warning = function (this: {option: string; display: boolean}, text: any): void {
        if (this.display === true) {
            console.log(createLog(this.option, 'WARNING'), text);
        }
        return;
    };

    error = function (this: {option: string; display: boolean}, text: any): void {
        if (this.display === true) {
            console.log(createLog(this.option, 'ERROR'), text);
        }
        return;
    };
}

export default Log;

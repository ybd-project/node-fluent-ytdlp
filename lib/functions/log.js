'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const logColor = {
    DEBUG: '36',
    SUCCESS: '32',
    WARNING: '33',
    ERROR: '31',
};
function createLog(option, type) {
    return '\u001b[' + logColor[type] + 'm[' + type + ' : ' + option + ']:\u001b[0m';
}
class Log {
    display = false;
    option = '';
    constructor(option, test = false) {
        this.display = test || false;
        this.option = option;
    }
    log = function (text) {
        if (this.display === true) {
            console.log(createLog(this.option, 'DEBUG'), text);
        }
        return;
    };
    success = function (text) {
        if (this.display === true) {
            console.log(createLog(this.option, 'SUCCESS'), text);
        }
        return;
    };
    warning = function (text) {
        if (this.display === true) {
            console.log(createLog(this.option, 'WARNING'), text);
        }
        return;
    };
    error = function (text) {
        if (this.display === true) {
            console.log(createLog(this.option, 'ERROR'), text);
        }
        return;
    };
}
exports.default = Log;

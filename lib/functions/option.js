'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.encode = void 0;
/**
 * 「option-name」のようなオプションを「optionName」のように変換します。
 * @param text 変換するオプション名を指定してください。
 */
function encode(text) {
    return text.split('').reduce((previous, current) => {
        if (current === '-') {
            previous.next = true;
        }
        else {
            if (previous.next === true) {
                previous.text += current.toUpperCase();
                previous.next = false;
            }
            else {
                previous.text += current;
            }
        }
        return previous;
    }, { text: '', next: false }).text;
}
exports.encode = encode;
/**
 * 「optionName」のようなオプションを「option-name」のように変換します。
 * @param text 変換するオプション名を指定してください。
 */
function decode(text) {
    return text.split('').reduce((previous, current) => {
        if (/[A-Z]/g.test(current)) {
            previous.text += '-' + current.toLowerCase();
        }
        else {
            previous.text += current;
        }
        return previous;
    }, { text: '', next: false }).text;
}
exports.decode = decode;
exports.default = { encode, decode };

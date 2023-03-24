'use strict';

/**
 * 「option-name」のようなオプションを「optionName」のように変換します。
 * @param text 変換するオプション名を指定してください。
 */
function encode(text: string): string {
    return text.split('').reduce(
        (previous, current) => {
            if (current === '-') {
                previous.next = true;
            } else {
                if (previous.next === true) {
                    previous.text += current.toUpperCase();
                    previous.next = false;
                } else {
                    previous.text += current;
                }
            }
            return previous;
        },
        {text: '', next: false},
    ).text;
}

/**
 * 「optionName」のようなオプションを「option-name」のように変換します。
 * @param text 変換するオプション名を指定してください。
 */
function decode(text: string): string {
    return text.split('').reduce(
        (previous, current) => {
            if (/[A-Z]/g.test(current)) {
                previous.text += '-' + current.toLowerCase();
            } else {
                previous.text += current;
            }
            return previous;
        },
        {text: '', next: false},
    ).text;
}

export {encode, decode};
export default {encode, decode};

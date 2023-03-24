/**
 * 「option-name」のようなオプションを「optionName」のように変換します。
 * @param text 変換するオプション名を指定してください。
 */
declare function encode(text: string): string;
/**
 * 「optionName」のようなオプションを「option-name」のように変換します。
 * @param text 変換するオプション名を指定してください。
 */
declare function decode(text: string): string;
export { encode, decode };
declare const _default: {
    encode: typeof encode;
    decode: typeof decode;
};
export default _default;

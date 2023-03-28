'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sync_fetch_1 = __importDefault(require("sync-fetch"));
const fs_1 = __importDefault(require("fs"));
const node_path_1 = __importDefault(require("node:path"));
const decompress_1 = __importDefault(require("decompress"));
const arch_1 = __importDefault(require("arch"));
const urls = (() => {
    function ffbinariesResponseExtract(response, type) {
        const url = {
            windows: {
                x86: '',
                x64: '',
            },
            linux: {
                x86: '',
                x64: '',
            },
            macos: {
                x86: '',
                x64: '',
            },
        };
        if (response !== false) {
            url.windows = {
                x86: response.bin['windows-64'][type],
                x64: response.bin['windows-64'][type],
            };
            url.linux = {
                x86: response.bin['linux-32'][type],
                x64: response.bin['linux-64'][type],
            };
            url.macos = {
                x86: response.bin['osx-64'][type],
                x64: response.bin['osx-64'][type],
            };
        }
        return url;
    }
    const apiResponse = (0, sync_fetch_1.default)('https://ffbinaries.com/api/v1/version/latest', {
        method: 'get',
    }).json(), //ffbinariesのAPIを使用してffmpeg・ffprobeのダウンロードURLを取得する
    ytdlpDownloadUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download', urlData = {
        ytdlp: {
            windows: {
                x86: ytdlpDownloadUrl + '/yt-dlp_x86.exe',
                x64: ytdlpDownloadUrl + '/yt-dlp.exe',
            },
            linux: {
                x86: ytdlpDownloadUrl + '/yt-dlp',
                x64: ytdlpDownloadUrl + '/yt-dlp',
            },
            macos: {
                x86: ytdlpDownloadUrl + '/yt-dlp_macos',
                x64: ytdlpDownloadUrl + '/yt-dlp_macos',
            },
        },
        ffmpeg: ffbinariesResponseExtract(apiResponse || false, 'ffmpeg'),
        ffprobe: ffbinariesResponseExtract(apiResponse || false, 'ffprobe'),
    };
    return urlData;
})(), platform = (() => {
    //ここでwindows・linux・macosの三種類に分別する
    let platform = '';
    switch (process.platform) {
        case 'win32':
        case 'cygwin': {
            //Windows系OS
            platform = 'windows';
            break;
        }
        case 'linux':
        case 'aix':
        case 'freebsd':
        case 'haiku':
        case 'netbsd':
        case 'openbsd':
        case 'sunos': {
            //Linux系OS
            platform = 'linux';
            break;
        }
        case 'darwin': {
            //Mac系OS
            platform = 'macos';
            break;
        }
        case 'android': {
            //対象外のOS
            throw new Error('このOSは対象外です。\nWindows系、Linux系、Mac系に該当するOSの場合は「https://github.com/ybd-project/node-fluent-ytdlp」にIssuesを立ててください。');
            break;
        }
        default: {
            //判定の対象外のOS
            platform = 'linux';
            break;
        }
    }
    return platform;
})(), arch = (0, arch_1.default)(), binFolderPath = node_path_1.default.join(__dirname + '/../../bin').replace(/\\/g, '/'), binaryPath = {
    ytdlp: {
        windows: binFolderPath + '/yt-dlp.exe',
        other: binFolderPath + '/yt-dlp',
    },
    ffmpeg: {
        windows: binFolderPath + '/ffmpeg.exe',
        other: binFolderPath + '/ffmpeg',
        zip: binFolderPath + '/ffmpeg.zip',
    },
    ffprobe: {
        windows: binFolderPath + '/ffprobe.exe',
        other: binFolderPath + '/ffprobe',
        zip: binFolderPath + '/ffprobe.zip',
    },
};
function getBinary(url) {
    return (0, sync_fetch_1.default)(url, { method: 'get' }).arrayBuffer();
}
//yt-dlpのダウンロード
function ytdlp() {
    return new Promise((resolve, reject) => {
        console.log('[FLUENT-YTDLP]: yt-dlpをダウンロード中です...');
        const binary = getBinary(urls.ytdlp[platform][arch]);
        if (platform === 'windows') {
            fs_1.default.writeFile(binaryPath.ytdlp.windows, Buffer.from(binary), (err) => {
                if (err) {
                    return reject(err);
                }
                else {
                    resolve(binaryPath.ytdlp.windows);
                }
            });
        }
        else {
            fs_1.default.writeFile(binaryPath.ytdlp.other, Buffer.from(binary), (err) => {
                if (err) {
                    return reject(err);
                }
                else {
                    fs_1.default.chmodSync(binaryPath.ytdlp.other, 0o755);
                    resolve(binaryPath.ytdlp.other);
                }
            });
        }
    });
}
//ffmpegのダウンロード
function ffmpeg() {
    return new Promise((resolve, reject) => {
        console.log('[FLUENT-YTDLP]: ffmpegをダウンロード中です...');
        const binary = getBinary(urls.ffmpeg[platform][arch]);
        fs_1.default.writeFile(binaryPath.ffmpeg.zip, Buffer.from(binary), (err) => {
            if (err) {
                return reject(err);
            }
            else {
                //zipを解凍する処理を実装する
                (0, decompress_1.default)(binaryPath.ffmpeg.zip, binFolderPath)
                    .then(() => {
                    let path = binaryPath.ffmpeg.windows;
                    if (platform !== 'windows') {
                        fs_1.default.chmodSync(binaryPath.ffmpeg.other, 0o755);
                        path = binaryPath.ffmpeg.other;
                    }
                    fs_1.default.rmSync(binaryPath.ffmpeg.zip);
                    return resolve(path);
                })
                    .catch((err) => {
                    return reject(err);
                });
            }
        });
    });
}
//ffprobeのダウンロード
function ffprobe() {
    return new Promise((resolve, reject) => {
        console.log('[FLUENT-YTDLP]: ffprobeをダウンロード中です...');
        const binary = getBinary(urls.ffprobe[platform][arch]);
        fs_1.default.writeFile(binaryPath.ffprobe.zip, Buffer.from(binary), (err) => {
            if (err) {
                return reject(err);
            }
            else {
                //zipを解凍する処理を実装する
                (0, decompress_1.default)(binaryPath.ffprobe.zip, binFolderPath)
                    .then(() => {
                    let path = binaryPath.ffprobe.windows;
                    if (platform !== 'windows') {
                        fs_1.default.chmodSync(binaryPath.ffprobe.other, 0o755);
                        path = binaryPath.ffprobe.other;
                    }
                    fs_1.default.rmSync(binaryPath.ffprobe.zip);
                    return resolve(path);
                })
                    .catch((err) => {
                    return reject(err);
                });
            }
        });
    });
}
fs_1.default.rmSync(binFolderPath, { recursive: true, force: true }); //binフォルダの削除
fs_1.default.mkdirSync(binFolderPath, { recursive: true }); //binフォルダの作成
//ダウンロード処理の実行
Promise.all([ytdlp(), ffmpeg(), ffprobe()])
    .then((binaryPathData) => {
    console.log('[FLUENT-YTDLP]: yt-dlp・ffmpeg・ffprobeのダウンロードに成功しました。');
    fs_1.default.writeFileSync(binFolderPath + '/info.json', JSON.stringify({
        binaryPath: {
            ytdlp: binaryPathData[0],
            ffmpeg: binaryPathData[1],
            ffprobe: binaryPathData[2],
            folder: binFolderPath,
        },
        os: {
            platform,
            arch,
        },
    }));
})
    .catch((err) => {
    throw new Error('PostInstall Error: ' + err);
});

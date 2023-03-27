'use strict';

/* モジュールの読み込みとURLの指定 */

const fluentYTDlp = require('fluent-ytdlp'); //JavaScript
import fluentYTDlp from 'fluent-ytdlp'; //TypeScript

const ytdlp = new fluentYTDlp('URL'); //インスタンス作成

//-------------------------------//

/* ストリームでデータを取得する */
const ytdlpProcessStream = ytdlp.run();

ytdlpProcessStream.stdout.setEncoding('utf8');
ytdlpProcessStream.stdout.on('data', (stdout) => {
    /* yt-dlpの標準出力 */
    console.log(stdout);
});

ytdlpProcessStream.stderr.setEncoding('utf8');
ytdlpProcessStream.stderr.on('data', (stderr) => {
    /* yt-dlpの標準エラー出力 */
    console.log(stderr);
});

ytdlpProcessStream.on('close', (code) => {
    /* 終了した場合の処理 */
    console.log('プロセスはコード「' + code + '」で終了しました。');
});

//-------------------------------//

/* ストリームを使用しない */
const ytdlpProcessNoStream = ytdlp.noStreamRun({
    type: 'execFile',
    callback: function (err, stdout, stderr) {
        /* エラー */
        console.log(err);
        /* yt-dlpの標準出力 */
        console.log(stdout);
        /* yt-dlpの標準エラー出力 */
        console.log(stderr);
    },
});

ytdlpProcessNoStream.on('close', (code) => {
    /* 終了した場合の処理 */
    console.log('プロセスはコード「' + code + '」で終了しました。');
});

//-------------------------------//

/* スケジュールを設定して実行する */
ytdlp
    .scheduleRun({
        schedule: '2024/1/1 00:00',
    })
    .then((ytdlpProcessScheduleRun) => {
        ytdlpProcessScheduleRun.stdout.setEncoding('utf8');
        ytdlpProcessScheduleRun.stdout.on('data', (stdout) => {
            /* yt-dlpの標準出力 */
            console.log(stdout);
        });

        ytdlpProcessScheduleRun.stderr.setEncoding('utf8');
        ytdlpProcessScheduleRun.stderr.on('data', (stderr) => {
            /* yt-dlpの標準エラー出力 */
            console.log(stderr);
        });

        ytdlpProcessScheduleRun.on('close', (code) => {
            /* 終了した場合の処理 */
            console.log('プロセスはコード「' + code + '」で終了しました。');
        });
    })
    .catch((err) => {
        console.log(err);
    });

//-------------------------------//

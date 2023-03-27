'use strict';

/* モジュールの読み込みとURLの指定 */

const fluentYTDlp = require('fluent-ytdlp'); //JavaScript
import fluentYTDlp from 'fluent-ytdlp'; //TypeScript

const ytdlp = new fluentYTDlp('URL'); //インスタンス作成

//-------------------------------//

/* 解像度とファイル名、サムネイルの埋め込みの指定 */
ytdlp.resolution('1280x720').filename('Example').embedThumbnail().run();

//-------------------------------//

/* 利用できるフォーマットのリストアップとデバッグオプションの指定 */
ytdlp.listFormats().verbose().run();

//-------------------------------//

/* ライブ関係のオプションとフォーマットオプションの指定 */
ytdlp.liveFromStart().waitForVideo(60).format('bestvideo+bestaudio[ext=m4a]').mergeOutputFormat('mp4').run();

//-------------------------------//

/* 字幕関係のオプションの指定 */
ytdlp.embedSubs().writeAutoSubs().mergeOutputFormat('mp4').run();

//-------------------------------//

/* 回避オプションの指定 */
ytdlp.addHeaders('accept-language:ja').legacyServerConnect().run();

//-------------------------------//

/* 詳細度・シュミレーションオプションの指定 */
ytdlp.simulate().quiet().skipDownload().newline().run();

//-------------------------------//

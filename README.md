<div align="center">

# Node.js用のyt-dlp API - fluent-ytdlp

**Node.jsで簡単にyt-dlpを実行します。独自のコードを作成する必要はありません。**

このプロジェクトは、[fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg)を参考に作成されました。
</div>

## English version -> [README English Version](./README-EN.md)

## 目次
- [動作確認に関して](#動作確認に関して)
    - [Nodejs](#nodejs)
    - [OS](#os)
- [簡単な説明・注意](#簡単な説明・注意)
    - [説明](#説明)
    - [注意](#注意)
- [導入](#導入)
- [簡単な説明・注意](#簡単な説明・注意)
- [簡単な説明・注意](#簡単な説明・注意)
- [ライセンス](#ライセンス)

## 動作確認に関して

以下に記載されているNode.jsのバージョン、OSの種類以外ではこのAPIが正常に動作しない可能性があります。

### Nodejs
1. v19.7.0

### OS
1. Windows 11
2. Ubuntu 22.04
3. CentOS 7

## 簡単な説明・注意

### 説明
このプロジェクトは、yt-dlpをNode.jsで利用できるようにするAPIです。yt-dlpは、このAPIによって自動でダウンロードされるため、デバイスへのインストールは必要ありません。

### 注意
**1. 自己責任での利用をお願いします。このプロジェクトの利用によって発生した損害・損失等に関して開発者は一切の責任を取りません。**<br>
**2. このAPIは、Node.jsでの実行を目的としたものであり、ブラウザ等のNode.js以外の環境での動作は保証できません。**

## 導入

### npmを利用する場合
```sh
npm install fluent-ytdlp
```

### yarnを利用する場合
```sh
yarn add fluent-ytdlp
```

## 基本的な使用方法

このAPIは、実行（[`exec()`](#yt-dlpの実行)を実行）するとNode.jsのChildProcessでストリームを返します。<br>
ストリーム以外での実行は[ストリーム以外での実行](#ストリーム以外での実行)をご覧ください。

その他使用方法については、exampleフォルダをご覧ください。

### モジュールの読み込みとURLの指定

```js
const fluentYTDlp = require('fluent-ytdlp'); //モジュールの読み込み
const ytdlp = new fluentYTDlp('URL');
```

### yt-dlpオプションの指定なし

```js
const ytdlpProcess = ytdlp.exec(); //yt-dlpの実行

ytdlpProcess.stdout.on('data', () => {/* ffmpegの標準出力 */});
ytdlpProcess.stderr.on('data', () => {/* ffmpegの標準エラー出力 */});
ytdlpProcess.on('close', () => {/* した場合の処理 */});
```

### yt-dlpオプションの指定あり（解像度の指定）

```js
const ytdlpProcess = ytdlp.resolution('1920x1080').exec(); //yt-dlpの実行

ytdlpProcess.stdout.on('data', () => {/* ffmpegの標準出力 */});
ytdlpProcess.stderr.on('data', () => {/* ffmpegの標準エラー出力 */});
ytdlpProcess.on('close', () => {/* した場合の処理 */});
```

## オプション説明

### オプションに関する情報

#### オプション名の規則に関して
オプションの関数名は、全てyt-dlpでも同じオプション名となっています。<br>
**注意: 全ての関数名が同じとは限らず、例外として「アンダーバーがつく関数・exec関数・noStream関数・url関数」は独自オプション・関数をなります。**

#### オプション関数の引数に関して
関数に引数を渡す場合は、**文字列（String型）・数字（Number型）・真偽（Boolean型）・正規表現（RegExp型）・日付（Date型）のいずれかを指定**する必要があります。<br>
オプションには、一つの型を受け付ける関数と、複数の型を受け付ける関数があることに注意してください。<br>
受け付けない型を引数として渡された場合は、そのオプションは既定で適応されません。適応する場合は、[yt-dlpの実行](#yt-dlpの実行)をご覧ください。

#### 非推奨等のオプションに関して
yt-dlpで非推奨になったオプション等は[`otherOptions()`](#その他のオプションの指定)で指定することが可能ですが、**動作については保証できません。**

#### オプションの指定方法に関して
yt-dlpのオプションには、独自の指定方法をしなければならないオプションが多数あります。（[--playlist-items](#プレイリストからダウンロードする動画のインデックス選択)など）<br>
これらのオプション等の指定方法については、このドキュメントに随時追加していく予定ですので追加されていないオプションについては説明欄にある[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#usage-and-options)をご覧ください。

---

### yt-dlpの実行に関するオプション

---

### yt-dlpの実行
yt-dlpを指定されたオプションで実行します。オプションの関数へ受け付けない型を引数として渡している場合でもそのオプションを適応する必要がある場合は、この関数に`true`を引数として渡してください。

**関数名**: `exec()`

**引数の型**: `Boolean型`

```js
/* 適応しない */
ytdlp.exec();
ytdlp.exec(false);

/* 適応する */
ytdlp.exec(true);
```

---

### データ取得をストリーム以外で実行する
データの取得をストリーム以外での実行が必要な場合は、以下のオプション（`noStream()`）を使用してください。このオプションは、指定しない場合と比べて不安定な場合があります。

このオプションを指定した場合は、関数の返り値としてyt-dlpの出力したデータを一気に返します。

**関数名**: `noStream()`

```js
ytdlp.noStream().exec();
```

---

### yt-dlpに関するオプション

---

### ヘルプの取得
yt-dlpの`--help`オプションを使用することで表示される情報を返します。この情報に改行を含ませない場合は、引数に`true`を指定します。<br>
改行を含ませる場合は、`false`を指定するか何も指定しないでください。

**関数名**: `help()`

**引数の型**: `Boolean型`

**yt-dlpのオプション**: `-h`、`--help`

```js
/* 改行あり */
ytdlp.help();
ytdlp.help(false);

/* 改行なし */
ytdlp.help(true);
```

---

### バージョンの取得
yt-dlpのバージョンを返します。

**関数名**: `version()`

**yt-dlpのオプション**: `--version`

```js
ytdlp.version();
```

---

### yt-dlpのアップデート
yt-dlpをアップデートします。アップデートが完了しているかの確認は`_updateCompleted()`を実行します。

この際にアップデート先のバージョンを指定する必要がある場合は、[yt-dlpのアップデート先のバージョンを指定する](#yt-dlpのアップデート先のバージョンを指定する)をご覧ください。

**関数名**: `update()`、`noUpdate()`

**yt-dlpのオプション**: `-U`、`--update`、`--no-update`

```js
ytdlp.update(); //バージョンを指定しない
ytdlp.noUpdate(); //アップデートしない（yt-dlpのデフォルト）
```

#### _updateCompleted
アップデートが完了している場合は`true`を返し、その他の場合は、`false`を返します。

**関数名**: `_updateCompleted()`

```js
ytdlp._updateCompleted();
```

---

### yt-dlpのアップデート先のバージョンを指定する
yt-dlpのアップデート先のバージョンを指定できます。このオプションには、何かしらのバージョンを指定する必要があります。

**関数名**: `updateTo()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--update-to`

```js
ytdlp.updateTo('Version').exec();
```

---

### yt-dlpパスの取得
このAPIが、内部で使用するyt-dlpのパスを返します。

**関数名**: `_ytdlpPath()`

```js
ytdlp._ytdlpPath();
```

---

### その他パスの取得
このAPIが、内部で使用するffmpeg等をダウンロードするbinディレクトリパスを返します。

**関数名**: `_binPath()`

```js
ytdlp._binPath();
```

---

### 基本オプション

---

### URLの変更
URLを途中で変更することができます。このオプションは複数回指定することができ、一番最後に指定されたオプションが適応されます。このオプションには、何かしらのURLを指定する必要があります。

**関数名**: `url()`

**引数の型**: `String型`

```js
ytdlp.url('URL').exec();
```

---

### ダウンロードエラーの無視
yt-dlpによるダウンロードプロセスが、エラー等で失敗したとしても成功とみなすようにします。

**関数名**: `ignoreErrors()`

**yt-dlpのオプション**: `-i`、`--ignore-errors`

```js
ytdlp.ignoreErrors().exec();
```

---

### ダウンロードエラー時に処理を停止する
ダウンロード中にエラーが発生した場合、処理を中止するかを指定できます。このオプションは、どの関数を指定しても同じ結果となります。

**関数名**: `abortOnError()`、`noIgnoreErrors()`、`noAbortOnError()`

**yt-dlpのオプション**: `--abort-on-error`、`--no-ignore-errors`、`--no-abort-on-error`

```js
/* 処理を中止する */
ytdlp.abortOnError().exec();
ytdlp.noIgnoreErrors().exec();

/* 処理を中止しない（yt-dlpのデフォルト） */
ytdlp.noAbortOnError().exec();
```

---

### userAgentの取得
userAgentを取得できます。このオプションを指定するとその他のオプションを指定できなくなり、動画のダウンロードは実行されません。

**関数名**: `dumpUserAgent()`

**yt-dlpのオプション**: `--dump-user-agent`

```js
ytdlp.dumpUserAgent().exec();
```

---

### extractor 一覧の取得
extractorの一覧を配列で取得できます。このオプションを指定するとその他のオプションを指定できなくなり、動画のダウンロードは実行されません。

**関数名**: `listExtractors()`

**yt-dlpのオプション**: `--list-extractors`

```js
ytdlp.listExtractors().exec();
```

---

### extractor 一覧を説明付きで取得
extractorの一覧と説明を配列で取得できます。このオプションを指定するとその他のオプションを指定できなくなり、動画のダウンロードは実行されません。

**関数名**: `extractorDescriptions()`

**yt-dlpのオプション**: `--extractor-descriptions`

```js
ytdlp.extractorDescriptions().exec();
```

---

### 使用するextractorの指定
ダウンロード等に使用するextractorを指定します。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `useExtractors()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--use-extractor`

```js
ytdlp.useExtractors('Extractor Name').exec();
```

---

### URLではない値をURLとして指定された場合の処理の指定
URLではない値を、URLとして与えられた場合の処理を指定できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `defaultSearch()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--default-search`

```js
ytdlp.defaultSearch('Method').exec();
```

---

### 設定ファイルまたは、フォルダパスの指定
設定ファイルのパス、フォルダのパスを指定できます。このオプションには、何かしらの値を指定する必要があります。この設定ファイルのみを適応する場合は、[設定ファイルを限定する](#設定ファイルを限定する)をご覧ください。

**関数名**: `configLocation()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--config-locations`

```js
ytdlp.configLocation('PATH').exec();
```

---

### 設定ファイルの限定
`configLocation('PATH')`を使用して指定した設定ファイル以外を適応しない場合は、`ignoreConfig()`または`noConfig()`を使用してください。このオプションは、どちらの関数を指定しても同じ結果となります。

**関数名**: `ignoreConfig()`、`noConfig()`

**yt-dlpのオプション**: `--ignore-config`、`--no-config`

```js
ytdlp.ignoreConfig().exec();
ytdlp.noConfig().exec();
```

---

### 全ての設定ファイルの無視
どのようなオプションで設定ファイルを指定されてもその設定ファイルを無視します。このオプションを指定するとその他の設定ファイルに関するオプションが指定できなくなります。

**関数名**: `noConfigLocations()`

**yt-dlpのオプション**: `--no-config-locations`

```js
ytdlp.noConfigLocations().exec();
```

---

### プレイリスト展開
プレイリストの展開をするかを指定できます。

**関数名**: `flatPlaylist()`, `noFlatPlaylist()`

**yt-dlpのオプション**: `--flat-playlist`、`--no-flat-playlist`

```js
ytdlp.flatPlaylist().exec(); //プレイリスト展開をする
ytdlp.noFlatPlaylist().exec(); //プレイリスト展開をしない
```

---

### ライブのダウンロード開始を放送開始時にする - ~実験的~
YouTubeのライブを放送開始時からダウンロードするかを指定できます。

**関数名**: `liveFromStart()`, `noLiveFromStart()`

**yt-dlpのオプション**: `--live-from-start`、`--no-live-from-start`

```js
ytdlp.liveFromStart().exec(); //放送開始時からダウンロードする
ytdlp.noLiveFromStart().exec(); //ダウンロードしない（yt-dlpのデフォルト）
```

---

### ライブの予約ダウンロード待機中の再試行間隔の指定
ライブの予約ダウンロードの待機中の再試行間隔を指定できます。指定する場合は、**秒数**を指定してください。

**関数名**: `waitForVideo()`, `noWaitForVideo()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--wait-for-video`、`--no-wait-for-video`

```js
ytdlp.waitForVideo('Seconds').exec(); //再試行間隔を指定する
ytdlp.noWaitForVideo().exec(); //再試行間隔を指定しない（yt-dlpのデフォルト）
```

---

### 再生履歴の追加
再生履歴を残すことができます。このオプションはユーザー名・パスワードを指定しないと動作しません。

**関数名**: `markWatched()`, `noMarkWatched()`

**yt-dlpのオプション**: `--mark-watched`、`--no-mark-watched`

```js
ytdlp.markWatched().exec(); //再生履歴を残す
ytdlp.noMarkWatched().exec(); //再生履歴を残さない（yt-dlpのデフォルト）
```

---

### 出力にカラーコードを生成しない
このオプションを指定すると標準出力にカラーコードを生成しなくなります。

**関数名**: `noColors()`

**yt-dlpのオプション**: `--no-colors`

```js
ytdlp.noColors().exec();
```

---

### 各オプションの動作の違いの修正
各オプションのデフォルト動作の違いを元に戻すことができます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `compatOptions()`

**yt-dlpのオプション**: `--compat-options`

```js
ytdlp.compatOptions('OPTS').exec();
```

---

### ~~オプションエイリアスの作成~~ - 利用できません。
**注意:  正常に動作しない可能性があるため利用できません。改善策が見つかり次第、利用を可能にします。**

オプション文字列のエイリアスを作成できます。エイリアスの引数はPythonの文字列フォーマットにしたがってパースされます。

**関数名**: `alias()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--alias`

```js
ytdlp.alias('Alias').exec();
```

---

### ネットワークオプション

---

### プロキシの指定
yt-dlpで使用するプロキシを指定することができます。このオプションには、プロキシURLの指定が必要です。

**関数名**: `proxy()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--proxy`

```js
ytdlp.proxy('Proxy URL').exec();
```

---

### タイムアウト秒数の指定
タイムアウトの秒数を指定できます。このオプションには、タイムアウトの秒数の指定が必要です。<br>
タイムアウトの単位は、**秒**での指定となります。

**関数名**: `socketTimeout()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--socket-timeout`

```js
ytdlp.socketTimeout('Seconds').exec();
```

---

### クライアントIPの指定
バインド先のクライアントIPアドレスを指定できます。このオプションには、何かしらのアドレスを指定する必要があります。

**関数名**: `sourceAddress()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--source-address`

```js
ytdlp.sourceAddress('Address').exec();
```

---

### IPv4の使用を強制する
IPv4の使用を強制できます。

**関数名**: `forceIpv4()`

**yt-dlpのオプション**: `-4`、`--force-ipv4`

```js
ytdlp.forceIpv4().exec();
```

---

### IPv6の使用を強制する
IPv6の使用を強制できます。

**関数名**: `forceIpv6()`

**yt-dlpのオプション**: `-6`、`--force-ipv6`

```js
ytdlp.forceIpv6().exec();
```

---

### 「file://」URLの使用を許可する
「file://」で始まるURLの使用を許可できます。

**関数名**: `enableFileUrls()`

**yt-dlpのオプション**: `--enable-file-urls`

```js
ytdlp.enableFileUrls().exec();
```

---

### 地域制限

---

### サイトへのアクセス時のみプロキシを適応する
サイトへのアクセス時にのみプロキシを適応できます。[プロキシの指定](#プロキシの指定)と異なるのはダウンロード時にプロキシを適応するかしないかです。このオプションには、何かしらのプロキシURLを指定する必要があります。

**関数名**: `geoVerificationProxy()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--geo-verification-proxy`

```js
ytdlp.geoVerificationProxy('Proxy URL').exec();
```

---

### ヘッダー偽装による地域制限回避
ヘッダーを偽装することにより地域制限を回避できます。

**関数名**: `geoBypass()`、`noGeoBypass()`

**yt-dlpのオプション**: `--geo-bypass`、`--no-geo-bypass`

```js
ytdlp.geoBypass().exec(); //ヘッダーを偽装する（yt-dlpのデフォルト）
ytdlp.noGeoBypass().exec(); //ヘッダーを偽装しない
```

---

### 国コードを指定して地域制限を回避する
ISO 3166-2で規定された国コードを指定して地域制限を回避します。このオプションには、何かしらの国コードが必要です。

**関数名**: `geoBypassCountry()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--geo-bypass-country`

```js
ytdlp.geoBypassCountry('Country Code').exec();
```

---

### IPブロックで地域制限を強制的に回避する
CIDR表記で指定されたIPブロックを使用して強制的に地域制限を回避できます。このオプションには、何かしらのCIDR表記のIPブロックが必須です。

**関数名**: `geoBypassIpBlock()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--geo-bypass-ip-block`

```js
ytdlp.geoBypassIpBlock('IP BLOCK').exec();
```

---

### 動画選択

---

### プレイリストからダウンロードする動画のインデックス選択
プレイリストから動画をダウンロードするときに、その動画をプレイリストのインデックスで指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#video-selection)をご覧ください。

**関数名**: `playlistItems()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `-I`、`--playlist-items`

```js
ytdlp.playlistItems('Index').exec();
```

---

### 最大ダウンロード数の指定
ダウンロードする動画の最大ダウンロード数を指定できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `maxDownloads()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--max-downloads`

```js
ytdlp.maxDownloads('Number').exec();
```

---

### 最小ファイルサイズの指定
最小ファイルサイズを指定できます。このオプションには、何かしらの値が必要です。

**関数名**: `minFilesize()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--min-filesize`

```js
ytdlp.minFilesize('Size').exec();
```

---

### 最大ファイルサイズの指定
最大ファイルサイズを指定できます。このオプションには、何かしらの値が必要です。

**関数名**: `maxFilesize()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--max-filesize`

```js
ytdlp.maxFilesize('Size').exec();
```

---

### 動画のアップロード日時の指定
動画のアップロード日時を指定できます。日時の指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#video-selection)を見るかJavaScriptの[`Date`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date)を引数として指定してください。

**関数名**: `date()`

**引数の型**: `String型`、`Date型`

**yt-dlpのオプション**: `--date`

```js
ytdlp.date('Date').exec();
```

---

### 指定した日時より以前の動画を処理する
指定した日時より以前の動画を処理できます。日時の指定形式は[動画のアップロード日時の指定](#動画のアップロード日時の指定)をご覧ください。

**関数名**: `datebefore()`

**引数の型**: `String型`、`Date型`

**yt-dlpのオプション**: `--datebefore`

```js
ytdlp.datebefore('Date').exec();
```

---

### 指定した日時以降の動画を処理する
指定した日時より以前の動画を処理できます。日時の指定形式は[動画のアップロード日時の指定](#動画のアップロード日時の指定)をご覧ください。

**関数名**: `dateafter()`

**引数の型**: `String型`、`Date型`

**yt-dlpのオプション**: `--dateafter`

```js
ytdlp.dateafter('Date').exec();
```

---

### ダウンロードする動画をフィルタする
ダウンロードする動画をフィルタすることができます。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#video-selection)をご覧ください。

**関数名**: `matchFilters()`、`noMatchFilter()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--match-filters`、`--no-match-filter`

```js
ytdlp.matchFilters('Filter').exec(); //フィルタの指定
ytdlp.noMatchFilter().exec(); //フィルタを指定しない（yt-dlpのデフォルト）
```

動画が拒否された場合に処理を停止したい場合は、以下のオプションを使用してください。指定形式は上記と変わりありません。

**関数名**: `breakMatchFilters()`、`noBreakMatchFilters()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--break-match-filters`、`--no-break-match-filters`

```js
ytdlp.breakMatchFilters('Filter').exec(); //フィルタの指定
ytdlp.noBreakMatchFilters().exec(); //フィルタを指定しない（yt-dlpのデフォルト）
```

---

### プレイリストの無視
プレイリストを無視するかどうかを指定できます。

**関数名**: `noPlaylist()`、`yesPlaylist()`

**yt-dlpのオプション**: `--no-playlist`、`--yes-playlist`

```js
ytdlp.noPlaylist().exec(); //プレイリストを無視する
ytdlp.yesPlaylist().exec(); //プレイリストを無視しない
```

---

### 対象年齢を指定する
指定された年齢に合った動画のみをダウンロードします。

**関数名**: `ageLimit()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--age-limit`

```js
ytdlp.ageLimit('Years').exec();
```

---

### 動画IDの記録
ダウンロードした動画IDを記録し、記録された動画は二回目以降ダウンロードをスキップします。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `downloadArchive()`、`noDownloadArchive()`

**yt-dlpのオプション**: `--download-archive`、`--no-download-archive`

```js
ytdlp.downloadArchive().exec(); //動画IDを記録する
ytdlp.noDownloadArchive().exec(); //動画IDを記録しない（yt-dlpのデフォルト）
```

---

### アーカイブに含まれるファイルがある場合に処理を停止する
アーカイブに含まれるファイルがある場合に処理を停止するかを指定できます。

**関数名**: `breakOnExisting()`

**yt-dlpのオプション**: `--break-on-existing`

```js
ytdlp.breakOnExisting().exec();
```

---

### 特定のオプションを現在のURLのみに適応する
`--break-on-existing`、`--break-on-reject`、`--max-download`のオプションを、指定されているURLのみに適応できます。`noBreakPerInput()`は、ダウンロードキュー自体を中止します。

**関数名**: `breakPerInput()`、`noBreakPerInput()`

**yt-dlpのオプション**: `--break-per-input`、`--no-break-per-input`

```js
ytdlp.breakPerInput().exec();
ytdlp.noBreakPerInput().exec();
```

---

### エラー数の上限を指定する
指定されたエラー数を超えるとプレイリスト自体をスキップします。このオプションには、エラー数の上限を指定する必要があります。

**関数名**: `skipPlaylistAfterErrors()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--skip-playlist-after-errors`

```js
ytdlp.skipPlaylistAfterErrors('Number').exec();
```

---

### ダウンロードオプション

---

### 同時にダウンロードする動画フラグメント数の指定
DASHまたはhls動画の同時にダウンロードするフラグメント数を指定できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `concurrentFragments()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `-N`、`--concurrent-fragments`

```js
ytdlp.concurrentFragments('Number').exec();
```

---

### 最大ダウンロード速度の指定
動画をダウンロードする際の最大速度を制限できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `limitRate()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-r`、`--limit-rate`

```js
ytdlp.limitRate('RATE').exec();
```

---

### 最低ダウンロード速度の指定
動画をダウンロードする際の最小ダウンロード速度を指定できます。指定された値を下回ると再ダウンロードされます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `throttledRate()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--throttled-rate`

```js
ytdlp.throttledRate('Rate').exec();
```

---

### ダウンロード再試行回数の指定
ダウンロードの再試行回数を指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `retries()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `-R`、`--retries`

```js
ytdlp.retries('Retries').exec();
```

---

### ファイルアクセスエラー時の再試行回数の指定
ファイルアクセスエラー時に再試行する回数を指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `fileAccessRetries()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--file-access-retries`

```js
ytdlp.fileAccessRetries('Retries').exec();
```

---

### フラグメントのダウンロード再試行回数の指定
フラグメントのダウンロード再試行回数を指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `fragmentRetries()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--fragment-retries`

```js
ytdlp.fragmentRetries('Number').exec();
```

---

### 再試行の間にスリープする時間を指定する
再試行の間にスリープする時間を**秒単位**で指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `retrySleep()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--retry-sleep`

```js
ytdlp.retrySleep('Number').exec();
```

---

### ダウンロードできないフラグメントをスキップする
DASHまたはhls、ISMのダウンロードできないフラグメントをスキップできます。このオプションは、どちらの関数を指定しても同じ結果となります。

**関数名**: `noAbortOnUnavailableFragments()`、`skipUnavailableFragments()`

**yt-dlpのオプション**: `--no-abort-on-unavailable-fragments`、`--skip-unavailable-fragments`

```js
ytdlp.noAbortOnUnavailableFragments().exec();
ytdlp.skipUnavailableFragments().exec();
```

---

### ダウンロードできないフラグメントがある場合は、ダウンロードを中止する
動画にダウンロードできないフラグメントがある場合に、ダウンロードを中止できます。このオプションは、どちらの関数を指定しても同じ結果となります。

**関数名**: `abortOnUnavailableFragments()`、`noSkipUnavailableFragments()`

**yt-dlpのオプション**: `--abort-on-unavailable-fragments`、`--no-skip-unavailable-fragments`

```js
ytdlp.abortOnUnavailableFragments().exec();
ytdlp.abortOnUnavailableFragments().exec();
```

---

### ダウンロードしたフラグメントを残す
ダウンロード終了後、ダウンロードしたフラグメントを消さずにディスクに保存します。

**関数名**: `keepFragments()`、`noKeepFragments()`

**yt-dlpのオプション**: `--keep-fragments`、`--no-keep-fragments`

```js
ytdlp.keepFragments().exec(); //フラグメントを残す
ytdlp.noKeepFragments().exec(); //フラグメントを残さない（yt-dlpのデフォルト）
```

---

### ダウンロードバッファサイズの指定
ダウンロードバッファのサイズを指定できます。

**関数名**: `bufferSize()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--buffer-size`

```js
ytdlp.bufferSize('Size').exec();
```

---

### バッファサイズの自動調整
バッファサイズを[--buffer-size](#ダウンロードバッファサイズの指定)のデフォルト値（1024）から自動的に調整できます。

**関数名**: `resizeBuffer()`、`noResizeBuffer()`

**yt-dlpのオプション**: `--resize-buffer`、`--no-resize-buffer`

```js
ytdlp.resizeBuffer().exec(); //バッファサイズを自動的に調整する（yt-dlpのデフォルト）
ytdlp.noResizeBuffer().exec(); //バッファサイズを自動的に調整しない
```

---

### HTTPチャンクサイズの指定 - <div style="background: #6d7034;display: inline;">==実験的==</div>
HTTPダウンロードの際のチャンクのサイズを指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

このオプションは**実験的**なオプションです。

**関数名**: `httpChunkSize()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--http-chunk-size`

```js
ytdlp.httpChunkSize('Size').exec();
```

---

### プレイリストの動画をランダムにダウンロードする
プレイリストの動画をランダムな順番でダウンロードできます。

**関数名**: `playlistRandom()`

**yt-dlpのオプション**: `--playlistRandom`

```js
ytdlp.playlistRandom().exec();
```

---

### プレイリストのエントリーを処理しながらダウンロードする
プレイリストのエントリーを処理しながらプレイリストの動画をダウンロードできます。このオプションを使用すると、`%(n_entries)s`、`--playlist-random`、`--playlist-reverse`は無効になります。

**関数名**: `lazyPlaylist()`、`noLazyPlaylist()`

**yt-dlpのオプション**: `--lazy-playlist`、`--no-lazy-playlist`

```js
ytdlp.lazyPlaylist().exec(); //プレイリストのエントリーを処理しながらダウンロードする
ytdlp.noLazyPlaylist().exec(); //プレイリストの解析が終了してからダウンロードする（yt-dlpのデフォルト）
```

---

### 予想されるファイルサイズの書き込み
拡張ファイル属性に予想されるファイルサイズを書き込むことができます。

**関数名**: `xattrSetFilesize()`

**yt-dlpのオプション**: `--xattr-set-filesize`

```js
ytdlp.xattrSetFilesize().exec();
```

---

### hls動画にmpegtsコンテナを使用する
hls動画にmpegtsコンテナを使用することができます。

**関数名**: `hlsUseMpegts()`、`noHlsUseMpegts()`

**yt-dlpのオプション**: `--hls-use-mpegts`、`--no-hls-use-mpegts`

```js
ytdlp.hlsUseMpegts().exec(); //hls動画にmpegtsコンテナを使用する（ライブ配信の場合はyt-dlpのデフォルト）
ytdlp.noHlsUseMpegts().exec(); //hls動画にmpegtsコンテナを使用しない（ライブ配信以外の場合はyt-dlpのデフォルト）
```

---

### 一致するチャプターのみダウンロードする
動画のチャプターのタイトルが正規表現にマッチしたチャプターのみをダウンロードできます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `downloadSections()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--download-sections`

```js
ytdlp.downloadSections('Regex').exec();
```

---

### 使用するダウンローダー・プロトコルの指定
使用する外部ダウンローダーの名前、パスと使用するプロトコルを指定できます。このオプションには、何かしらの値を指定する必要があり、複数回の指定が可能です。このオプションは、どちらの関数を指定しても同じ結果となります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `downloader()`、`externalDownloader()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--downloader`、`--external-downloader`

```js
ytdlp.downloader('[Proto:]Name').exec();
ytdlp.externalDownloader('[Proto:]Name').exec();
```

---

### 使用するダウンローダーへ引数を与える
使用するダウンローダーに引数を与えることができます。このオプションには、何かしらの値を指定する必要があり、複数回の指定が可能です。このオプションは、どちらの関数を指定しても同じ結果となります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `downloaderArgs()`、`externalDownloaderArgs()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--downloader-args`、`--external-downloader-args`

```js
ytdlp.downloaderArgs('Name:Args').exec();
ytdlp.externalDownloaderArgs('Name:Args').exec();
```

---

### ファイルシステムオプション

---

### ダウンロードする動画URLを記述したファイルを指定する
動画URLを記述したファイルを指定してまとめてダウンロードできます。このオプションには、何かしらの値を指定する必要があります。`--no-batch-file`はバッチファイルを無視します。

**関数名**: `batchFile()`、`noBatchFile()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-a`、`--batch-file`、`--no-batch-file`

```js
ytdlp.batchFile('File').exec(); //ファイルを指定してダウンロードする
ytdlp.noBatchFile().exec(); //バッチファイルからURLを読み込まない（yt-dlpのデフォルト）
```

---

### ダウンロード先のパスの指定
ファイルをダウンロードするパスを指定できます。このオプションには、何かしらの値を指定する必要があります。このオプションは、[--output](#ファイル名のテンプレートを指定する)オプションが絶対パスの場合、**無効**になります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#filesystem-options)をご覧ください。

**関数名**: `paths()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-P`、`--paths`

```js
ytdlp.paths('[Types:]Path').exec();
```

---

### ファイル名のテンプレートを指定する
ファイル名のテンプレートを指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#output-template)をご覧ください。

**関数名**: `output()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-o`、`--output`

```js
ytdlp.output('[Types:]Template').exec();
```

---

### テンプレートで使用できない変数がある場合の指定
[上記（--output）](#ファイル名のテンプレートを指定する)オプションで指定したテンプレート名で使用できないものを、指定された文字で置き換えることができます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `outputNaPlaceholder()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--output-na-placeholder`

```js
ytdlp.outputNaPlaceholder('Text').exec();
```

---

### ファイル名をASCII文字に限定する
ファイル名をASCII文字のみにすることができます。このオプションを指定すると`&`やスペース等、ASCII文字ではないものは使用されなくなります。

**関数名**: `restrictFilenames()`、`noRestrictFilenames()`

**yt-dlpのオプション**: `--restrict-filenames`、`--no-restrict-filenames`

```js
ytdlp.restrictFilenames().exec(); //ASCII文字に限定する
ytdlp.noRestrictFilenames().exec(); //ASCII文字に限定しない（yt-dlpのデフォルト）
```

---

### ファイル名をWindows互換にする
ファイル名を強制的にWindows互換にすることができます。`windowsFilenames()`を指定するとどのような場合でもファイル名をWindows互換にします。

**関数名**: `windowsFilenames()`、`noWindowsFilenames()`

**yt-dlpのオプション**: `--windows-filenames`、`--no-windows-filenames`

```js
ytdlp.windowsFilenames().exec(); //どのような場合でもWindows互換にする
ytdlp.noWindowsFilenames().exec(); //Windowsの場合のみWindows互換にする（yt-dlpのデフォルト）
```

---

### ファイル名の長さを制限する
ファイル名の長さ（拡張子を除いて）を指定された文字数までに制限できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `trimFilenames()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--trim-filenames`

```js
ytdlp.trimFilenames('Length').exec();
```

---

### ファイルを上書きしない
同じファイルが存在する際に一切上書きさせないことができます。

**関数名**: `noOverwrites()`

**yt-dlpのオプション**: `-w`、`--no-overwrites`

```js
ytdlp.noOverwrites().exec();
```

---

### ファイルを上書きする
動画ファイルおよびメタデータのファイルを全て上書きします。`noForceOverwrites()`を指定すると関連ファイルのみが上書きされます。

**関数名**: `forceOverwrites()`、`noForceOverwrites()`

**yt-dlpのオプション**: `--force-overwrites`、`--no-force-overwrites`

```js
ytdlp.forceOverwrites().exec(); //全て上書き
ytdlp.noForceOverwrites().exec(); //関連ファイルのみ上書き（yt-dlpのデフォルト）
```

---

### 部分的にダウンロードされたファイル/フラグメントを再開する
部分的にダウンロードされた動画を途中からダウンロードを再開できます。

**関数名**: `continue()`、`noContinue()`

**yt-dlpのオプション**: `-c`、`--continue`、`--no-continue`

```js
ytdlp.continue().exec(); //途中から再開する（yt-dlpのデフォルト）
ytdlp.noContinue().exec(); //途中から再開しない
```

---

### .partファイルを使用する
ダウンロードの際に.partファイルを使用することができます。

**関数名**: `part()`、`noPart()`

**yt-dlpのオプション**: `--part`、`--no-part`

```js
ytdlp.part().exec(); //.partファイルを使用する（yt-dlpのデフォルト）
ytdlp.noPart().exec(); //.partファイルを使用せずファイルに直接書き込む
```

---

### ファイルの更新日時の指定
ファイルの更新日時を`Last-modified`ヘッダーの値にすることができます。

**関数名**: `mtime()`、`noMtime()`

**yt-dlpのオプション**: `--mtime`、`--no-mtime`

```js
ytdlp.mtime().exec(); //更新日時をLast-modifiedヘッダーの値にする（yt-dlpのデフォルト）
ytdlp.noMtime().exec(); //更新日時をLast-modifiedヘッダーの値にしない
```

---

### 動画の説明を別ファイルに書き込む
動画の説明を`.description`ファイルに書き込むことができます。

**関数名**: `writeDescription()`、`noWriteDescription()`

**yt-dlpのオプション**: `--write-description`、`--no-write-description`

```js
ytdlp.writeDescription().exec(); //.descriptionファイルに書き込む
ytdlp.noWriteDescription().exec(); //.descriptionファイルに書き込まない（yt-dlpのデフォルト）
```

---

### 動画のメタデータを別ファイルに書き込む
動画のメタデータを`.info.json`ファイルに書き込むことができます。**（個人情報が含まれる可能性があります。）**

**関数名**: `writeInfoJson()`、`noWriteInfoJson()`

**yt-dlpのオプション**: `--write-info-json`、`--no-write-info-json`

```js
ytdlp.writeInfoJson().exec(); //.info.jsonに書き込む
ytdlp.noWriteInfoJson().exec(); //.info.jsonに書き込まない（yt-dlpのデフォルト）
```

ファイル名等のプライベートなデータを削除したい場合は以下のオプションを使用します。**（このオプションを使用しても個人情報等が完全に削除されるわけではありません。）**

**関数名**: `cleanInfoJson()`、`noCleanInfoJson()`

**yt-dlpのオプション**: `--clean-info-json`、`--no-clean-info-json`

```js
ytdlp.cleanInfoJson().exec(); //プライベートなデータを削除する（yt-dlpのデフォルト）
ytdlp.noCleanInfoJson().exec(); //プライベートなデータを削除せずに全てのデータを書き込む
```

---

### プレイリストのメタデータを書き込む
[`writeDescription()`](#動画の説明を別ファイルに書き込む)や[`writeInfoJson()`](#動画のメタデータを別ファイルに書き込む)を使用する際にプレイリストのメタデータも書き込むかを指定できます。

**関数名**: `writePlaylistMetafiles()`、`noWritePlaylistMetafiles()`

**yt-dlpのオプション**: `--write-playlist-metafiles`、`--no-write-playlist-metafiles`

```js
ytdlp.writePlaylistMetafiles().exec(); //プレイリストのメタデータを書き込む（yt-dlpのデフォルト）
ytdlp.noWritePlaylistMetafiles().exec(); //プレイリストのメタデータを書き込まない
```

---

### コメントを[`.info.json`](#動画のメタデータを別ファイルに書き込む)に書き込む
動画のコメントを[`.info.json`](#動画のメタデータを別ファイルに書き込む)に書き込むことができます。

**関数名**: `writeComments()`、`getComments()`、`noWriteComments()`、`noGetComments()`

**yt-dlpのオプション**: `--write-comments`、`--get-comments`、`--no-write-comments`、`--no-get-comments`

```js
/* コメントを.info.jsonに書き込む（どちらの関数の結果は同じです。） */
ytdlp.writeComments().exec();
ytdlp.getComments().exec();

/* コメントを.info.jsonに書き込まない（どちらの関数の結果は同じです。） */
ytdlp.noWriteComments().exec();
ytdlp.noGetComments().exec();
```

---

### [`.info.json`](#動画のメタデータを別ファイルに書き込む)から情報を読み込む
[`.info.json`](#動画のメタデータを別ファイルに書き込む)のファイルパスから動画情報を読み込みます。書き込みは、[`writeInfoJson()`](#動画のメタデータを別ファイルに書き込む)を使用して書き込むことができます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `loadInfoJson()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--load-info-json`

```js
ytdlp.loadInfoJson('File').exec();
```

---

### クッキーを読み込む
クッキーを読み込むかを指定できます。読み込む場合は、何かしらの値を指定する必要があります。

**関数名**: `cookies()`、`noCookies()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--cookies`、`--no-cookies`

```js
ytdlp.cookies('File').exec(); //クッキーを読み込む
ytdlp.noCookies().exec(); //クッキーを読み込まない（yt-dlpのデフォルト）
```

---

### ブラウザからクッキーを読み込む
ブラウザからクッキーを読み込むことができます。読み込む場合は、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#filesystem-options)をご覧ください。

**関数名**: `cookiesFromBrowser()`、`noCookiesFromBrowser()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--cookies-from-browser `、`--no-cookies-from-browser`

```js
ytdlp.cookiesFromBrowser('Browser[+Keyring][:Profile][::Container]').exec(); //ブラウザからクッキーを読み込む
ytdlp.noCookiesFromBrowser().exec(); //ブラウザからクッキーを読み込まない（yt-dlpのデフォルト）
```

---

### キャッシュの保存先の指定
ダウンロードした情報を永久に保存するディレクトリパスを指定できます。指定する場合は、何かしらの値を指定する必要があります。

**関数名**: `cacheDir()`、`noCacheDir()`、`rmCacheDir()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--cache-dir`、`--no-cache-dir`、`--rm-cache-dir`

```js
ytdlp.cacheDir('Dir').exec(); //キャッシュを保存する
ytdlp.noCacheDir().exec(); //キャッシュを保存しない
ytdlp.rmCacheDir().exec(); //キャッシュを保存せず、すべて削除する
```

---

### サムネイルオプション

---

### ダウンロードする動画URLを記述したファイルを指定する
動画URLを記述したファイルを指定してまとめてダウンロードできます。このオプションには、何かしらの値を指定する必要があります。`--no-batch-file`はバッチファイルを無視します。

**関数名**: `batchFile()`、`noBatchFile()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-a`、`--batch-file`、`--no-batch-file`

```js
ytdlp.batchFile('File').exec(); //ファイルを指定してダウンロードする
ytdlp.noBatchFile().exec(); //バッチファイルからURLを読み込まない（yt-dlpのデフォルト）
```

---

### ダウンロード先のパスの指定
ファイルをダウンロードするパスを指定できます。このオプションには、何かしらの値を指定する必要があります。このオプションは、[--output](#ファイル名のテンプレートを指定する)オプションが絶対パスの場合、**無効**になります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#filesystem-options)をご覧ください。

**関数名**: `paths()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-P`、`--paths`

```js
ytdlp.paths('[Types:]Path').exec();
```

---

### インターネットショートカットオプション

---

### ダウンロードする動画URLを記述したファイルを指定する
動画URLを記述したファイルを指定してまとめてダウンロードできます。このオプションには、何かしらの値を指定する必要があります。`--no-batch-file`はバッチファイルを無視します。

**関数名**: `batchFile()`、`noBatchFile()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-a`、`--batch-file`、`--no-batch-file`

```js
ytdlp.batchFile('File').exec(); //ファイルを指定してダウンロードする
ytdlp.noBatchFile().exec(); //バッチファイルからURLを読み込まない（yt-dlpのデフォルト）
```

---

### ダウンロード先のパスの指定
ファイルをダウンロードするパスを指定できます。このオプションには、何かしらの値を指定する必要があります。このオプションは、[--output](#ファイル名のテンプレートを指定する)オプションが絶対パスの場合、**無効**になります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#filesystem-options)をご覧ください。

**関数名**: `paths()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-P`、`--paths`

```js
ytdlp.paths('[Types:]Path').exec();
```

---

### ダウンロード先のパスの指定
ファイルをダウンロードするパスを指定できます。このオプションには、何かしらの値を指定する必要があります。このオプションは、[--output](#ファイル名のテンプレートを指定する)オプションが絶対パスの場合、**無効**になります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#filesystem-options)をご覧ください。

**関数名**: `paths()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-P`、`--paths`

```js
ytdlp.paths('[Types:]Path').exec();
```

---

### ダウンロード先のパスの指定
ファイルをダウンロードするパスを指定できます。このオプションには、何かしらの値を指定する必要があります。このオプションは、[--output](#ファイル名のテンプレートを指定する)オプションが絶対パスの場合、**無効**になります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#filesystem-options)をご覧ください。

**関数名**: `paths()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-P`、`--paths`

```js
ytdlp.paths('[Types:]Path').exec();
```

---

## ライセンス
このプロジェクトは、MITライセンスで公開されています。詳細はLICENSEファイルまたは以下のライセンス文をご覧ください。

<div align="center">

### ライセンス文
MIT License

Copyright © 2023 YBD Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

### Copyright © 2023 YBD Project

</div>
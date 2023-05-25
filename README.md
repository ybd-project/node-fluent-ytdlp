<div align="center">

# Node.js用のyt-dlp API - fluent-ytdlp

**Node.jsで簡単にyt-dlpを実行します。独自のコードを作成する必要はありません。**

このAPIは、[fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg)を参考に作成されました。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/node-fluent-ytdlp.svg)](https://badge.fury.io/js/node-fluent-ytdlp)
[![Monthly downloads](https://img.shields.io/npm/dt/node-fluent-ytdlp.svg)](https://www.npmjs.com/package/node-fluent-ytdlp)
</div>

## インストールする際の注意点
このAPIはインストールする際にyt-dlpやffmpegなどの必要なバイナリをダウンロードします。

そのためインストール時に時間がかかる場合がありますがバグではありませんので終了するまでお待ちください。（ダウンロードにかかる時間はインターネットの速度によって異なります。）

### 自動的にダウンロードさせないようにする
yt-dlpなどを自動的にダウンロードさせないようにするには、環境変数「FLUENT_YTDLP_NO_AUTO_DOWNLOAD」に何かしらの値を設定してください。（設定したあとは、一度ターミナルを終了してください。終了しないと環境変数が取得できないため。）

## 目次
- [説明・注意](#説明・注意)
    - [説明](#説明)
    - [注意](#注意)
- [導入](#導入)
    - [npmを使用する場合](#npmを使用する場合)
    - [yarnを使用する場合](#yarnを使用する場合)
- [基本的な使用方法](#基本的な使用方法)
    - [モジュールの読み込みとURLの指定](#モジュールの読み込みとurlの指定)
    - [yt-dlpオプションの指定なし](#yt-dlpオプションの指定なし)
    - [yt-dlpオプションの指定あり（解像度の指定）](#yt-dlpオプションの指定あり解像度の指定)
- [応用的な使用方法](#応用的な使用方法)
    - [複数のオプション指定](#複数のオプション指定)
- [オプション説明](#オプション説明)
    - [オプションに関する情報](#オプションに関する情報)
    - [yt-dlpなどのバイナリパスの設定に関するオプション](#yt-dlpなどのバイナリパスの設定に関するオプション)
    - [yt-dlpの実行に関するオプション](#yt-dlpの実行に関するオプション)
    - [簡易オプション](#簡易オプション)
    - [その他のオプション](#その他のオプション)
    - [yt-dlpに関するオプション](#yt-dlpに関するオプション)
    - [一般オプション](#一般オプション---公式ドキュメント)
    - [ネットワークオプション](#ネットワークオプション---公式ドキュメント)
    - [地域制限オプション](#地域制限オプション---公式ドキュメント)
    - [動画選択オプション](#動画選択オプション---公式ドキュメント)
    - [ダウンロードオプション](#ダウンロードオプション---公式ドキュメント)
    - [ファイルシステムオプション](#ファイルシステムオプション---公式ドキュメント)
    - [サムネイルオプション](#サムネイルオプション---公式ドキュメント)
    - [インターネットショートカットオプション](#インターネットショートカットオプション---公式ドキュメント)
    - [冗長性・シミュレーションオプション](#冗長性・シミュレーションオプション---公式ドキュメント)
    - [回避オプション](#回避オプション---公式ドキュメント)
    - [動画フォーマットオプション](#動画フォーマットオプション---公式ドキュメント)
    - [字幕オプション](#字幕オプション---公式ドキュメント)
    - [認証オプション](#認証オプション---公式ドキュメント)
    - [ポストプロセッサーオプション](#ポストプロセッサーオプション---公式ドキュメント)
    - [SponsorBlockオプション](#sponsorblockオプション---公式ドキュメント)
    - [Extractor オプション](#extractor-オプション---公式ドキュメント)
- [ライセンス](#ライセンス)
    - [ライセンス文](#ライセンス文)

## 説明・注意

### 説明

#### このAPIに関して
このAPIは、yt-dlpをNode.jsで利用できるようにするAPIです。

#### このAPIのメリット
1. yt-dlpやffmpeg、ffprobeはこのAPIによって自動でダウンロードされるため独自のコードを書く必要はありません。（yt-dlp・ffmpeg・ffprobeのみ）
2. yt-dlpを実行する関数などを用意する必要はなく、このAPIを読み込むだけですぐに利用を開始できます。
3. このAPIはオープンソースソフトウェアであるため、利用のために料金を払ったり、許可を取る必要はありません。（利用は自己責任です。）

#### このAPIのデメリット
1. yt-dlpのバグなどによって動作しない場合があります。
2. yt-dlpのオプションなどが更新されるとすぐにはそのオプションを使用できない可能性があります。
3. このAPIにない機能は独自のコードを用意する必要があります。（追加してほしい機能はDiscussions（議論）の「新機能の要望」に送信してください！）

#### このAPIの開発に関して
このAPIの開発は、**YBD Project**が行っています。

### 注意
**1. 自己責任での利用をお願いします。このAPIの利用によって発生した損害・損失等に関して開発者は一切の責任を取りません。**<br>
**2. このAPIは、Node.jsでの実行を目的としたものであり、ブラウザ等のNode.js以外の環境での動作は保証できません。**

## このAPIを支援する
現時点でこのAPIを支援する方法は、このAPIを利用（npmからダウンロード）していただくかSNS等で拡散する方法の二つがあります。<br>
少しだけでも利用していただくだけで相当な支援となります！（開発者側としてはうれしいです！）

## このAPIのバグ報告・改善
このAPIのバグ報告などは[`CONTRIBUTING.md`](./CONTRIBUTING.md)をご覧ください。

このAPI自体、READMEやCONTRIBUTINGなどのドキュメントの改善点はDiscussions（議論）の「改善点」に質問として送信してください。ここに送信された改善点は開発者が定期的に閲覧し、その質問に対する回答として返信していきます。

## 導入

### npmを使用する場合
```bash
npm install node-fluent-ytdlp
```

### yarnを使用する場合
```bash
yarn add node-fluent-ytdlp
```

## 基本的な使用方法

このAPIは、実行（[`run()`](#yt-dlpの実行)を実行）するとNode.jsのChildProcessでストリームを返します。

### 実行の種類

#### ストリームでデータを取得する
[`run()`](#yt-dlpの実行)を使用して実行してください。

#### ストリームを使用せずデータを取得する
[`noStreamRun()`](#ストリーム以外で実行する)を使用して実行してください。

#### 実行する日時を指定して実行する
[`scheduleRun()`](#スケジュールで実行する)を使用して実行してください。

### モジュールの読み込みとURLの指定

デバッグを有効にしない場合は、以下のコードを使用してください。

```js
const fluentYTDlp = require('node-fluent-ytdlp'); //モジュールの読み込み
const ytdlp = new fluentYTDlp('URL'); //インスタンスの作成
```

TypeScriptで使用する場合は、requireのコードをimportに変更するだけで対応できます。
```ts
import fluentYTDlp from 'node-fluent-ytdlp'; //モジュールの読み込み
const ytdlp = new fluentYTDlp('URL'); //インスタンスの作成
```

デバッグ（実行のログ出力）を行う場合は、以下のコードを使用してください。（インスタンス作成の第二引数に`true`を指定します。）<br>
**注意**: 間違った形式で指定しているオプションを強制的に適応したい場合は、[`run()`](#yt-dlpの実行)の引数に`{force: true}`を渡してください。

```js
const ytdlp = new fluentYTDlp('URL', true); //インスタンスの作成
```

### yt-dlpオプションの指定なし

```js
const ytdlpProcess = ytdlp.run(); //yt-dlpの実行

ytdlpProcess.stdout.on('data', () => {/* yt-dlpの標準出力 */});
ytdlpProcess.stderr.on('data', () => {/* yt-dlpの標準エラー出力 */});
ytdlpProcess.on('close', () => {/* 終了した場合の処理 */});
```

### yt-dlpオプションの指定あり（解像度の指定）

```js
const ytdlpProcess = ytdlp.resolution('1920x1080').run(); //yt-dlpの実行

ytdlpProcess.stdout.on('data', () => {/* yt-dlpの標準出力 */});
ytdlpProcess.stderr.on('data', () => {/* yt-dlpの標準エラー出力 */});
ytdlpProcess.on('close', () => {/* 終了した場合の処理 */});
```

その他使用方法については、[examplesフォルダ](/examples/)をご覧ください。

## 応用的な使用方法

複数のオプションを指定してyt-dlpを実行したい場合は以下のように記述します。

### 複数のオプション指定

```js
ytdlp.resolution('1920x1080').filename('Test').format('bestvideo+bestaudio[ext=m4a]').run();
```

## オプション説明

### オプションに関する情報

#### オプションの種類に関して
yt-dlpのオプションには、同じ意味を持つ別名のオプションが存在するためそのような関数は「・」で区切り、全く違うオプションは、「、」で区切っています。

#### オプション名に関して
ここに記載されているオプションは、全てyt-dlpと同じ名前となります。その他、このAPIを簡単に利用するための簡易オプション等は独自命名となります。

#### オプション関数の引数に関して
関数に引数を渡す場合は、**文字列（String型）・数字（Number型）・真偽（Boolean型）・日付（Date型）・JSON（Object型）のいずれかを指定**する必要があります。<br>
オプションには、一つの型を受け付ける関数と、複数の型を受け付ける関数があることに注意してください。<br>
受け付けない型を引数として渡された場合は、そのオプションは既定で適応されません。適応する場合は、[yt-dlpの実行](#yt-dlpの実行)をご覧ください。

#### 非推奨等のオプションに関して
yt-dlpで非推奨になったオプション等は[`otherOptions()`](#その他のオプションの指定)で指定することが可能ですが、**動作については保証できません。**

#### オプションの指定方法に関して
yt-dlpのオプションには、独自の指定方法をしなければならないオプションが多数あります。（[--playlist-items](#プレイリストからダウンロードする動画のインデックス選択)など）<br>
これらのオプション等の指定方法については、このドキュメントに随時追加していく予定ですので追加されていないオプションについては説明欄にある[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#usage-and-options)をご覧ください。

---

### yt-dlpなどのバイナリパスの設定に関するオプション

---

### yt-dlpなどのバイナリパスの設定する
yt-dlpなどを指定されたパスで実行できるようになります。

**関数名**: `setBinaryPath()`

**引数の型**: `Object型`

**引数説明**:（以下のオプションは、絶対パスで指定しないと正常に機能しない場合があります。値がない場合は、設定されません。）
- `ytdlp`: yt-dlpのバイナリパスを指定します。
- `ffmpeg`: ffmpegのバイナリパスを指定します。
- `ffprobe`: ffprobeのバイナリパスを指定します。

```js
/* バイナリパスを設定する */
ytdlp.setBinaryPath({
    ytdlp: 'Path',
    ffmpeg: 'Path'
});
```

---

### yt-dlpの実行に関するオプション

---

### yt-dlpの実行
yt-dlpを指定されたオプションで実行します。引数の説明は以下をご覧ください。

**関数名**: `run()`

**引数の型**: `Object型`

**引数説明**:
- `force`: 間違ったオプションの指定をしていても強制的に適応します。（デフォルトは`false`）
- `spawnOptions`: Node.jsの`spawn`に渡すオプションを指定できます。

```js
/* 間違ったオプションを強制的に適応しない（デフォルト） */
ytdlp.run();
ytdlp.run({});
ytdlp.run({
    force: false
});

/* 間違ったオプションを強制的に適応する */
ytdlp.run({
    force: true
});

/* spawnにオプションを渡す */
ytdlp.run({
    spawnOptions: {
        shell: true,
        cwd: '/cwd/dir/'
    }
});
```

---

### スケジュールで実行する
yt-dlpを指定された時間に実行します。引数の説明は以下をご覧ください。

**関数名**: `scheduleRun()`

**引数の型**: `Object型`

**引数説明**:
- `force`: 間違ったオプションの指定をしていても強制的に適応します。（デフォルトは`false`）
- `spawnOptions`: Node.jsの`spawn`に渡すオプションを指定できます。
- `schedule`: yt-dlpを実行する日時を指定できます。このオプションを指定するとこの関数は`Promise`を返すようになります。このオプションでは、`new Date`を内部的に使用するため`new Date`で使用できない日時の引数を渡されるとエラーが発生する可能性があります。

```js
/* スケジュールを設定する（Promise） */
ytdlp.run({
    schedule: '2023/03/27 15:30'
}).then(ytdlpProcess => {
    ytdlpProcess.stdout.on('data', () => {/* yt-dlpの標準出力 */});
    ytdlpProcess.stderr.on('data', () => {/* yt-dlpの標準エラー出力 */});
    ytdlpProcess.on('close', () => {/* 終了した場合の処理 */});
}).catch(err => {
    /* 日時が過去の場合などにエラー（Reject）が返される */
    console.log(err);
});
```

---

### ストリーム以外で実行する
データの取得をストリーム以外で行う必要がある場合は、以下のオプション（`noStreamRun()`）を使用してください。このオプションは、指定しない場合と比べて不安定な場合があります。

このオプションを指定した場合は、引数を指定することで値を指定できます。

**関数名**: `noStreamRun()`

**引数の型**: `Object型`

**引数説明**:
- `type`: 実行するChild_processの関数を指定できます。（`exec`または`execFile`）
- `callback`: 実行結果を受け取るコールバック関数を指定できます。
- `force`: 間違ったオプションの指定をしていても強制的に適応します。（デフォルトは`false`）

```js
/* 「exec」で実行する */
ytdlp.noStreamRun({
    type: 'exec',
    callback: function (err, stdout, stderr) {/* Process... */}
});

/* 「execFile」で実行する */
ytdlp.noStreamRun({
    type: 'execFile',
    callback: function (err, stdout, stderr) {/* Process... */}
});
```

---

### 簡易オプション

---

このセクションでは、このAPIを簡単に利用するためのオプション等を紹介します。細かにオプションを指定する必要がある場合はこの簡易オプションを使用しないでください。

---

### 解像度の指定
解像度を指定できます。「横×縦」で指定することができます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `resolution()`

**引数の型**: `String型`

```js
ytdlp.resolution('1920x1080').run();
```

縦と横を個別で指定する必要がある場合は以下のオプションを使用してください。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `width()`、`height()`

**引数の型**: `String型`、`Number型`

```js
ytdlp.width('1920').run(); //横の指定
ytdlp.height('1080').run(); //縦の指定
```

---

### ファイル名の指定
ダウンロード後のファイル名を指定できます。（拡張子の指定は、[`extension()`](#ファイル拡張子の指定)を使用してください。）このオプションには、何かしらの値を指定する必要があります。

**関数名**: `filename()`

**引数の型**: `String型`

```js
ytdlp.filename('Name').run();
```

---

### ファイル拡張子の指定
ダウンロード後のファイル拡張子を指定できます。この拡張子はyt-dlpで利用できる拡張子を指定してください。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `extension()`

**引数の型**: `String型`

```js
ytdlp.extension('Ext').run();
```

---

### その他のオプション

---

### URLの変更
URLを途中で変更することができます。このオプションは複数回指定することができ、一番最後に指定されたオプションが適応されます。このオプションには、何かしらのURLを指定する必要があります。

**関数名**: `url()`

**引数の型**: `String型`

```js
ytdlp.url('URL').run();
```

---

### その他のオプションの指定
yt-dlpで非推奨等になっているオプションは、このAPIでは正式に対応していないため、このオプションを使用して指定することができます。

指定形式は、JSONのキー名をオプション名とし、JSONの値をそのオプションへ値とします。オプションへの値が必要ない場合は、`true`を指定します。<br>
**注意**: オプション名はハイフンの次の文字を**大文字**とします。ここを間違えると正常にオプションが適応されない可能性があります。

**関数名**: `otherOptions()`

**引数の型**: `Object型`

```js
ytdlp.otherOptions({
    allFormats: true
}).run(); //「--all-formats」を適応する場合（yt-dlpで非推奨のオプション）

ytdlp.otherOptions({
    autonumberStart: 2
}).run(); //「--autonumber-start」に「2」を渡して適応する場合（yt-dlpで非推奨のオプション）
```

---

### yt-dlpパスの取得
このAPIが、内部で使用するyt-dlpのパスを返します。

**関数名**: `_ytdlpPath()`

```js
ytdlp._ytdlpPath();
```

---

### ffmpegパスの取得
このAPIが、内部で使用するffmpegのパスを返します。

**関数名**: `_ffmpegPath()`

```js
ytdlp._ffmpegPath();
```

---

### ffprobeパスの取得
このAPIが、内部で使用するffprobeのパスを返します。

**関数名**: `_ffprobePath()`

```js
ytdlp._ffprobePath();
```

---

### その他パスの取得
このAPIが、内部で使用するffmpeg等をダウンロードするbinディレクトリパスを返します。

**関数名**: `_binPath()`

```js
ytdlp._binPath();
```

---

### yt-dlpに関するオプション

---

ここからはオプションの値を細かく指定できます。yt-dlpを使用したことがないユーザーは[簡易オプション](#簡易オプション)を使用するか、公式ドキュメントを見てからオプションを使用することをおすすめします。

---

### ヘルプの取得
yt-dlpの`--help`オプションを適応します。

**関数名**: `help()`

**yt-dlpのオプション**: `-h`・`--help`

```js
ytdlp.help().run();
```

---

### バージョンの取得
yt-dlpの`--version`を適応します。

**関数名**: `version()`

**yt-dlpのオプション**: `--version`

```js
ytdlp.version().run();
```

---

### yt-dlpのアップデート
yt-dlpをアップデートします。

この際にアップデート先のバージョンを指定する必要がある場合は、[yt-dlpのアップデート先のバージョンを指定する](#yt-dlpのアップデート先のバージョンを指定する)をご覧ください。

**関数名**: `update()`、`noUpdate()`

**yt-dlpのオプション**: `-U`・`--update`、`--no-update`

```js
ytdlp.update().run(); //バージョンを指定しない
ytdlp.noUpdate().run(); //アップデートしない（yt-dlpのデフォルト）
```

---

### yt-dlpのアップデート先のバージョンを指定する
yt-dlpのアップデート先のバージョンを指定できます。このオプションには、何かしらのバージョンを指定する必要があります。

**関数名**: `updateTo()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--update-to`

```js
ytdlp.updateTo('Version').run();
```

---

### 一般オプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#general-options)

---

### ダウンロードエラーの無視
yt-dlpによるダウンロードプロセスが、エラー等で失敗したとしても成功とみなすようにします。

**関数名**: `ignoreErrors()`

**yt-dlpのオプション**: `-i`・`--ignore-errors`

```js
ytdlp.ignoreErrors().run();
```

---

### ダウンロードエラー時に処理を停止する
ダウンロード中にエラーが発生した場合、処理を中止するかを指定できます。このオプションは、どの関数を指定しても同じ結果となります。

**関数名**: `abortOnError()`、`noIgnoreErrors()`、`noAbortOnError()`

**yt-dlpのオプション**: `--abort-on-error`・`--no-ignore-errors`・`--no-abort-on-error`

```js
/* 処理を中止する */
ytdlp.abortOnError().run();
ytdlp.noIgnoreErrors().run();

/* 処理を中止しない（yt-dlpのデフォルト） */
ytdlp.noAbortOnError().run();
```

---

### userAgentの取得
userAgentを取得できます。このオプションを指定するとその他のオプションを指定できなくなり、動画のダウンロードは実行されません。

**関数名**: `dumpUserAgent()`

**yt-dlpのオプション**: `--dump-user-agent`

```js
ytdlp.dumpUserAgent().run();
```

---

### extractor 一覧の取得
extractorの一覧を配列で取得できます。このオプションを指定するとその他のオプションを指定できなくなり、動画のダウンロードは実行されません。

**関数名**: `listExtractors()`

**yt-dlpのオプション**: `--list-extractors`

```js
ytdlp.listExtractors().run();
```

---

### extractor 一覧を説明付きで取得
extractorの一覧と説明を配列で取得できます。このオプションを指定するとその他のオプションを指定できなくなり、動画のダウンロードは実行されません。

**関数名**: `extractorDescriptions()`

**yt-dlpのオプション**: `--extractor-descriptions`

```js
ytdlp.extractorDescriptions().run();
```

---

### 使用するextractorの指定
ダウンロード等に使用するextractorを指定します。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `useExtractors()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--use-extractor`

```js
ytdlp.useExtractors('Extractor Name').run();
```

---

### URLではない値をURLとして指定された場合の処理の指定
URLではない値を、URLとして与えられた場合の処理を指定できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `defaultSearch()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--default-search`

```js
ytdlp.defaultSearch('Method').run();
```

---

### 設定ファイルまたは、フォルダパスの指定
設定ファイルのパス、フォルダのパスを指定できます。このオプションには、何かしらの値を指定する必要があります。この設定ファイルのみを適応する場合は、[設定ファイルを限定する](#設定ファイルを限定する)をご覧ください。

**関数名**: `configLocation()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--config-locations`

```js
ytdlp.configLocation('PATH').run();
```

---

### 設定ファイルの限定
`configLocation('PATH')`を使用して指定した設定ファイル以外を適応しない場合は、`ignoreConfig()`または`noConfig()`を使用してください。このオプションは、どちらの関数を指定しても同じ結果となります。

**関数名**: `ignoreConfig()`、`noConfig()`

**yt-dlpのオプション**: `--ignore-config`・`--no-config`

```js
ytdlp.ignoreConfig().run();
ytdlp.noConfig().run();
```

---

### 全ての設定ファイルの無視
どのようなオプションで設定ファイルを指定されてもその設定ファイルを無視します。このオプションを指定するとその他の設定ファイルに関するオプションが指定できなくなります。

**関数名**: `noConfigLocations()`

**yt-dlpのオプション**: `--no-config-locations`

```js
ytdlp.noConfigLocations().run();
```

---

### プレイリスト展開
プレイリストの展開をするかを指定できます。

**関数名**: `flatPlaylist()`, `noFlatPlaylist()`

**yt-dlpのオプション**: `--flat-playlist`、`--no-flat-playlist`

```js
ytdlp.flatPlaylist().run(); //プレイリスト展開をする
ytdlp.noFlatPlaylist().run(); //プレイリスト展開をしない
```

---

### ライブのダウンロード開始を放送開始時にする - <div style="background: #6d7034;display: inline;">==実験的==</div>
YouTubeのライブを放送開始時からダウンロードするかを指定できます。

**関数名**: `liveFromStart()`, `noLiveFromStart()`

**yt-dlpのオプション**: `--live-from-start`、`--no-live-from-start`

```js
ytdlp.liveFromStart().run(); //放送開始時からダウンロードする
ytdlp.noLiveFromStart().run(); //ダウンロードしない（yt-dlpのデフォルト）
```

---

### ライブの予約ダウンロード待機中の再試行間隔の指定
ライブの予約ダウンロードの待機中の再試行間隔を指定できます。指定する場合は、**秒数**を指定してください。

**関数名**: `waitForVideo()`, `noWaitForVideo()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--wait-for-video`、`--no-wait-for-video`

```js
ytdlp.waitForVideo('Seconds').run(); //再試行間隔を指定する
ytdlp.noWaitForVideo().run(); //再試行間隔を指定しない（yt-dlpのデフォルト）
```

---

### 再生履歴の追加
再生履歴を残すことができます。このオプションはユーザー名・パスワードを指定しないと動作しません。

**関数名**: `markWatched()`, `noMarkWatched()`

**yt-dlpのオプション**: `--mark-watched`、`--no-mark-watched`

```js
ytdlp.markWatched().run(); //再生履歴を残す
ytdlp.noMarkWatched().run(); //再生履歴を残さない（yt-dlpのデフォルト）
```

---

### 出力にカラーコードを生成しない
このオプションを指定すると標準出力にカラーコードを生成しなくなります。

**関数名**: `noColors()`

**yt-dlpのオプション**: `--no-colors`

```js
ytdlp.noColors().run();
```

---

### 各オプションの動作の違いの修正
各オプションのデフォルト動作の違いを元に戻すことができます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `compatOptions()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--compat-options`

```js
ytdlp.compatOptions('OPTS').run();
```

---

### ~~オプションエイリアスの作成~~ - 利用できません。
**注意:  正常に動作しない可能性があるため利用できません。改善策が見つかり次第、利用を可能にします。**

オプション文字列のエイリアスを作成できます。エイリアスの引数はPythonの文字列フォーマットにしたがってパースされます。

**関数名**: `alias()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--alias`

```js
ytdlp.alias('Alias').run();
```

---

### ネットワークオプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#network-options)

---

### プロキシの指定
yt-dlpで使用するプロキシを指定することができます。このオプションには、プロキシURLの指定が必要です。

**関数名**: `proxy()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--proxy`

```js
ytdlp.proxy('Proxy URL').run();
```

---

### タイムアウト秒数の指定
タイムアウトの秒数を指定できます。このオプションには、タイムアウトの秒数の指定が必要です。<br>
タイムアウトの単位は、**秒**での指定となります。

**関数名**: `socketTimeout()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--socket-timeout`

```js
ytdlp.socketTimeout('Seconds').run();
```

---

### クライアントIPの指定
バインド先のクライアントIPアドレスを指定できます。このオプションには、何かしらのアドレスを指定する必要があります。

**関数名**: `sourceAddress()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--source-address`

```js
ytdlp.sourceAddress('Address').run();
```

---

### IPv4の使用を強制する
IPv4の使用を強制できます。

**関数名**: `forceIpv4()`

**yt-dlpのオプション**: `-4`・`--force-ipv4`

```js
ytdlp.forceIpv4().run();
```

---

### IPv6の使用を強制する
IPv6の使用を強制できます。

**関数名**: `forceIpv6()`

**yt-dlpのオプション**: `-6`・`--force-ipv6`

```js
ytdlp.forceIpv6().run();
```

---

### 「file://」URLの使用を許可する
「file://」で始まるURLの使用を許可できます。

**関数名**: `enableFileUrls()`

**yt-dlpのオプション**: `--enable-file-urls`

```js
ytdlp.enableFileUrls().run();
```

---

### 地域制限オプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#geo-restriction)

---

### サイトへのアクセス時のみプロキシを適応する
サイトへのアクセス時にのみプロキシを適応できます。[プロキシの指定](#プロキシの指定)と異なるのはダウンロード時にプロキシを適応するかしないかです。このオプションには、何かしらのプロキシURLを指定する必要があります。

**関数名**: `geoVerificationProxy()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--geo-verification-proxy`

```js
ytdlp.geoVerificationProxy('Proxy URL').run();
```

---

### ヘッダー偽装による地域制限回避
ヘッダーを偽装することにより地域制限を回避できます。

**関数名**: `geoBypass()`、`noGeoBypass()`

**yt-dlpのオプション**: `--geo-bypass`、`--no-geo-bypass`

```js
ytdlp.geoBypass().run(); //ヘッダーを偽装する（yt-dlpのデフォルト）
ytdlp.noGeoBypass().run(); //ヘッダーを偽装しない
```

---

### 国コードを指定して地域制限を回避する
ISO 3166-2で規定された国コードを指定して地域制限を回避します。このオプションには、何かしらの国コードが必要です。

**関数名**: `geoBypassCountry()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--geo-bypass-country`

```js
ytdlp.geoBypassCountry('Country Code').run();
```

---

### IPブロックで地域制限を強制的に回避する
CIDR表記で指定されたIPブロックを使用して強制的に地域制限を回避できます。このオプションには、何かしらのCIDR表記のIPブロックが必須です。

**関数名**: `geoBypassIpBlock()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--geo-bypass-ip-block`

```js
ytdlp.geoBypassIpBlock('IP BLOCK').run();
```

---

### 動画選択オプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#video-selection)

---

### プレイリストからダウンロードする動画のインデックス選択
プレイリストから動画をダウンロードするときに、その動画をプレイリストのインデックスで指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#video-selection)をご覧ください。

**関数名**: `playlistItems()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-I`・`--playlist-items`

```js
ytdlp.playlistItems('Index').run();
```

---

### 最大ダウンロード数の指定
ダウンロードする動画の最大ダウンロード数を指定できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `maxDownloads()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--max-downloads`

```js
ytdlp.maxDownloads('Number').run();
```

---

### 最小ファイルサイズの指定
最小ファイルサイズを指定できます。このオプションには、何かしらの値が必要です。

**関数名**: `minFileSize()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--min-filesize`

```js
ytdlp.minFileSize('Size').run();
```

---

### 最大ファイルサイズの指定
最大ファイルサイズを指定できます。このオプションには、何かしらの値が必要です。

**関数名**: `maxFileSize()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--max-filesize`

```js
ytdlp.maxFileSize('Size').run();
```

---

### 動画のアップロード日時の指定
動画のアップロード日時を指定できます。日時の指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#video-selection)を見るかJavaScriptの[`Date`](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date)を引数として指定してください。

**関数名**: `date()`

**引数の型**: `String型`、`Date型`

**yt-dlpのオプション**: `--date`

```js
ytdlp.date('Date').run();
```

---

### 指定した日時より以前の動画を処理する
指定した日時より以前の動画を処理できます。日時の指定形式は[動画のアップロード日時の指定](#動画のアップロード日時の指定)をご覧ください。

**関数名**: `dateBefore()`

**引数の型**: `String型`、`Date型`

**yt-dlpのオプション**: `--datebefore`

```js
ytdlp.dateBefore('Date').run();
```

---

### 指定した日時以降の動画を処理する
指定した日時より以前の動画を処理できます。日時の指定形式は[動画のアップロード日時の指定](#動画のアップロード日時の指定)をご覧ください。

**関数名**: `dateAfter()`

**引数の型**: `String型`、`Date型`

**yt-dlpのオプション**: `--dateafter`

```js
ytdlp.dateAfter('Date').run();
```

---

### ダウンロードする動画をフィルタする
ダウンロードする動画をフィルタすることができます。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#video-selection)をご覧ください。

**関数名**: `matchFilters()`、`noMatchFilter()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--match-filters`、`--no-match-filter`

```js
ytdlp.matchFilters('Filter').run(); //フィルタの指定
ytdlp.noMatchFilter().run(); //フィルタを指定しない（yt-dlpのデフォルト）
```

動画が拒否された場合に処理を停止したい場合は、以下のオプションを使用してください。指定形式は上記と変わりありません。

**関数名**: `breakMatchFilters()`、`noBreakMatchFilters()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--break-match-filters`、`--no-break-match-filters`

```js
ytdlp.breakMatchFilters('Filter').run(); //フィルタの指定
ytdlp.noBreakMatchFilters().run(); //フィルタを指定しない（yt-dlpのデフォルト）
```

---

### プレイリストの無視
プレイリストを無視するかどうかを指定できます。

**関数名**: `noPlaylist()`、`yesPlaylist()`

**yt-dlpのオプション**: `--no-playlist`、`--yes-playlist`

```js
ytdlp.noPlaylist().run(); //プレイリストを無視する
ytdlp.yesPlaylist().run(); //プレイリストを無視しない
```

---

### 対象年齢を指定する
指定された年齢に合った動画のみをダウンロードします。

**関数名**: `ageLimit()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--age-limit`

```js
ytdlp.ageLimit('Years').run();
```

---

### 動画IDの記録
ダウンロードした動画IDを記録し、記録された動画は二回目以降ダウンロードをスキップします。`downloadArchive()`を使用する場合、何かしらの値を指定する必要があります。

**関数名**: `downloadArchive()`、`noDownloadArchive()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--download-archive`、`--no-download-archive`

```js
ytdlp.downloadArchive('File').run(); //動画IDを記録する
ytdlp.noDownloadArchive().run(); //動画IDを記録しない（yt-dlpのデフォルト）
```

---

### アーカイブに含まれるファイルがある場合に処理を停止する
アーカイブに含まれるファイルがある場合に処理を停止するかを指定できます。

**関数名**: `breakOnExisting()`

**yt-dlpのオプション**: `--break-on-existing`

```js
ytdlp.breakOnExisting().run();
```

---

### 特定のオプションを現在のURLのみに適応する
`--break-on-existing`、`--break-on-reject`、`--max-download`のオプションを、指定されているURLのみに適応できます。`noBreakPerInput()`は、ダウンロードキュー自体を中止します。

**関数名**: `breakPerInput()`、`noBreakPerInput()`

**yt-dlpのオプション**: `--break-per-input`、`--no-break-per-input`

```js
ytdlp.breakPerInput().run();
ytdlp.noBreakPerInput().run();
```

---

### エラー数の上限を指定する
指定されたエラー数を超えるとプレイリスト自体をスキップします。このオプションには、エラー数の上限を指定する必要があります。

**関数名**: `skipPlaylistAfterErrors()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--skip-playlist-after-errors`

```js
ytdlp.skipPlaylistAfterErrors('Number').run();
```

---

### ダウンロードオプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)

---

### 同時にダウンロードする動画フラグメント数の指定
DASHまたはhls動画の同時にダウンロードするフラグメント数を指定できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `concurrentFragments()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `-N`・`--concurrent-fragments`

```js
ytdlp.concurrentFragments('Number').run();
```

---

### 最大ダウンロード速度の指定
動画をダウンロードする際の最大速度を制限できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `limitRate()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-r`・`--limit-rate`

```js
ytdlp.limitRate('RATE').run();
```

---

### 最低ダウンロード速度の指定
動画をダウンロードする際の最小ダウンロード速度を指定できます。指定された値を下回ると再ダウンロードされます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `throttledRate()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--throttled-rate`

```js
ytdlp.throttledRate('Rate').run();
```

---

### ダウンロード再試行回数の指定
ダウンロードの再試行回数を指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `retries()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `-R`・`--retries`

```js
ytdlp.retries('Retries').run();
```

---

### ファイルアクセスエラー時の再試行回数の指定
ファイルアクセスエラー時に再試行する回数を指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `fileAccessRetries()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--file-access-retries`

```js
ytdlp.fileAccessRetries('Retries').run();
```

---

### フラグメントのダウンロード再試行回数の指定
フラグメントのダウンロード再試行回数を指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `fragmentRetries()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--fragment-retries`

```js
ytdlp.fragmentRetries('Retries').run();
```

---

### 再試行の間にスリープする時間を指定する
再試行の間にスリープする時間を**秒単位**で指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `retrySleep()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--retry-sleep`

```js
ytdlp.retrySleep('Seconds').run();
```

---

### ダウンロードできないフラグメントをスキップする
DASHまたはhls、ISMのダウンロードできないフラグメントをスキップできます。このオプションは、どちらの関数を指定しても同じ結果となります。

**関数名**: `noAbortOnUnavailableFragments()`、`skipUnavailableFragments()`

**yt-dlpのオプション**: `--no-abort-on-unavailable-fragments`・`--skip-unavailable-fragments`

```js
ytdlp.noAbortOnUnavailableFragments().run();
ytdlp.skipUnavailableFragments().run();
```

---

### ダウンロードできないフラグメントがある場合は、ダウンロードを中止する
動画にダウンロードできないフラグメントがある場合に、ダウンロードを中止できます。このオプションは、どちらの関数を指定しても同じ結果となります。

**関数名**: `abortOnUnavailableFragments()`、`noSkipUnavailableFragments()`

**yt-dlpのオプション**: `--abort-on-unavailable-fragments`・`--no-skip-unavailable-fragments`

```js
ytdlp.abortOnUnavailableFragments().run();
ytdlp.noSkipUnavailableFragments().run();
```

---

### ダウンロードしたフラグメントを残す
ダウンロード終了後、ダウンロードしたフラグメントを消さずにディスクに保存します。

**関数名**: `keepFragments()`、`noKeepFragments()`

**yt-dlpのオプション**: `--keep-fragments`、`--no-keep-fragments`

```js
ytdlp.keepFragments().run(); //フラグメントを残す
ytdlp.noKeepFragments().run(); //フラグメントを残さない（yt-dlpのデフォルト）
```

---

### ダウンロードバッファサイズの指定
ダウンロードバッファのサイズを指定できます。

**関数名**: `bufferSize()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--buffer-size`

```js
ytdlp.bufferSize('Size').run();
```

---

### バッファサイズの自動調整
バッファサイズを[--buffer-size](#ダウンロードバッファサイズの指定)のデフォルト値（1024）から自動的に調整できます。

**関数名**: `resizeBuffer()`、`noResizeBuffer()`

**yt-dlpのオプション**: `--resize-buffer`、`--no-resize-buffer`

```js
ytdlp.resizeBuffer().run(); //バッファサイズを自動的に調整する（yt-dlpのデフォルト）
ytdlp.noResizeBuffer().run(); //バッファサイズを自動的に調整しない
```

---

### HTTPチャンクサイズの指定 - <div style="background: #6d7034;display: inline;">==実験的==</div>
HTTPダウンロードの際のチャンクのサイズを指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

このオプションは**実験的**なオプションです。

**関数名**: `httpChunkSize()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--http-chunk-size`

```js
ytdlp.httpChunkSize('Size').run();
```

---

### プレイリストの動画をランダムにダウンロードする
プレイリストの動画をランダムな順番でダウンロードできます。

**関数名**: `playlistRandom()`

**yt-dlpのオプション**: `--playlistRandom`

```js
ytdlp.playlistRandom().run();
```

---

### プレイリストのエントリーを処理しながらダウンロードする
プレイリストのエントリーを処理しながらプレイリストの動画をダウンロードできます。このオプションを使用すると、`%(n_entries)s`、`--playlist-random`、`--playlist-reverse`は無効になります。

**関数名**: `lazyPlaylist()`、`noLazyPlaylist()`

**yt-dlpのオプション**: `--lazy-playlist`、`--no-lazy-playlist`

```js
ytdlp.lazyPlaylist().run(); //プレイリストのエントリーを処理しながらダウンロードする
ytdlp.noLazyPlaylist().run(); //プレイリストの解析が終了してからダウンロードする（yt-dlpのデフォルト）
```

---

### 予想されるファイルサイズの書き込み
拡張ファイル属性に予想されるファイルサイズを書き込むことができます。

**関数名**: `xattrSetFileSize()`

**yt-dlpのオプション**: `--xattr-set-filesize`

```js
ytdlp.xattrSetFileSize().run();
```

---

### hls動画にmpegtsコンテナを使用する
hls動画にmpegtsコンテナを使用することができます。

**関数名**: `hlsUseMpegts()`、`noHlsUseMpegts()`

**yt-dlpのオプション**: `--hls-use-mpegts`、`--no-hls-use-mpegts`

```js
ytdlp.hlsUseMpegts().run(); //hls動画にmpegtsコンテナを使用する（ライブ配信の場合はyt-dlpのデフォルト）
ytdlp.noHlsUseMpegts().run(); //hls動画にmpegtsコンテナを使用しない（ライブ配信以外の場合はyt-dlpのデフォルト）
```

---

### 一致するチャプターのみダウンロードする
動画のチャプターのタイトルが正規表現にマッチしたチャプターのみをダウンロードできます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `downloadSections()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--download-sections`

```js
ytdlp.downloadSections('Regex').run();
```

---

### 使用するダウンローダー・プロトコルの指定
使用する外部ダウンローダーの名前、パスと使用するプロトコルを指定できます。このオプションには、何かしらの値を指定する必要があり、複数回の指定が可能です。このオプションは、どちらの関数を指定しても同じ結果となります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `downloader()`、`externalDownloader()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--downloader`・`--external-downloader`

```js
ytdlp.downloader('[Proto:]Name').run();
ytdlp.externalDownloader('[Proto:]Name').run();
```

---

### 使用するダウンローダーへ引数を与える
使用するダウンローダーに引数を与えることができます。このオプションには、何かしらの値を指定する必要があり、複数回の指定が可能です。このオプションは、どちらの関数を指定しても同じ結果となります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#download-options)をご覧ください。

**関数名**: `downloaderArgs()`、`externalDownloaderArgs()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--downloader-args`・`--external-downloader-args`

```js
ytdlp.downloaderArgs('Name:Args').run();
ytdlp.externalDownloaderArgs('Name:Args').run();
```

---

### ファイルシステムオプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#filesystem-options)

---

### ダウンロードする動画URLを記述したファイルを指定する
動画URLを記述したファイルを指定してまとめてダウンロードできます。このオプションには、何かしらの値を指定する必要があります。`--no-batch-file`はバッチファイルを無視します。

**関数名**: `batchFile()`、`noBatchFile()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-a`・`--batch-file`、`--no-batch-file`

```js
ytdlp.batchFile('File').run(); //ファイルを指定してダウンロードする
ytdlp.noBatchFile().run(); //バッチファイルからURLを読み込まない（yt-dlpのデフォルト）
```

---

### ダウンロード先のパスの指定
ファイルをダウンロードするパスを指定できます。このオプションには、何かしらの値を指定する必要があります。このオプションは、[--output](#ファイル名のテンプレートを指定する)オプションが絶対パスの場合、**無効**になります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#filesystem-options)をご覧ください。

**関数名**: `paths()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-P`・`--paths`

```js
ytdlp.paths('[Types:]Path').run();
```

---

### ファイル名のテンプレートを指定する
ファイル名のテンプレートを指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#output-template)をご覧ください。

**関数名**: `output()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-o`・`--output`

```js
ytdlp.output('[Types:]Template').run();
```

---

### テンプレートで使用できない変数がある場合の指定
[上記（--output）](#ファイル名のテンプレートを指定する)オプションで指定したテンプレート名で使用できないものを、指定された文字で置き換えることができます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `outputNaPlaceholder()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--output-na-placeholder`

```js
ytdlp.outputNaPlaceholder('Text').run();
```

---

### ファイル名をASCII文字に限定する
ファイル名をASCII文字のみにすることができます。このオプションを指定すると`&`やスペース等、ASCII文字ではないものは使用されなくなります。

**関数名**: `restrictFilenames()`、`noRestrictFilenames()`

**yt-dlpのオプション**: `--restrict-filenames`、`--no-restrict-filenames`

```js
ytdlp.restrictFilenames().run(); //ASCII文字に限定する
ytdlp.noRestrictFilenames().run(); //ASCII文字に限定しない（yt-dlpのデフォルト）
```

---

### ファイル名をWindows互換にする
ファイル名を強制的にWindows互換にすることができます。`windowsFilenames()`を指定するとどのような場合でもファイル名をWindows互換にします。

**関数名**: `windowsFilenames()`、`noWindowsFilenames()`

**yt-dlpのオプション**: `--windows-filenames`、`--no-windows-filenames`

```js
ytdlp.windowsFilenames().run(); //どのような場合でもWindows互換にする
ytdlp.noWindowsFilenames().run(); //Windowsの場合のみWindows互換にする（yt-dlpのデフォルト）
```

---

### ファイル名の長さを制限する
ファイル名の長さ（拡張子を除いて）を指定された文字数までに制限できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `trimFilenames()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--trim-filenames`

```js
ytdlp.trimFilenames('Length').run();
```

---

### ファイルを上書きしない
同じファイルが存在する際に一切上書きさせないことができます。

**関数名**: `noOverwrites()`

**yt-dlpのオプション**: `-w`・`--no-overwrites`

```js
ytdlp.noOverwrites().run();
```

---

### ファイルを上書きする
動画ファイルおよびメタデータのファイルを全て上書きします。`noForceOverwrites()`を指定すると関連ファイルのみが上書きされます。

**関数名**: `forceOverwrites()`、`noForceOverwrites()`

**yt-dlpのオプション**: `--force-overwrites`、`--no-force-overwrites`

```js
ytdlp.forceOverwrites().run(); //全て上書き
ytdlp.noForceOverwrites().run(); //関連ファイルのみ上書き（yt-dlpのデフォルト）
```

---

### 部分的にダウンロードされたファイル/フラグメントを再開する
部分的にダウンロードされた動画を途中からダウンロードを再開できます。

**関数名**: `continue()`、`noContinue()`

**yt-dlpのオプション**: `-c`・`--continue`、`--no-continue`

```js
ytdlp.continue().run(); //途中から再開する（yt-dlpのデフォルト）
ytdlp.noContinue().run(); //途中から再開しない
```

---

### .partファイルを使用する
ダウンロードの際に.partファイルを使用することができます。

**関数名**: `part()`、`noPart()`

**yt-dlpのオプション**: `--part`、`--no-part`

```js
ytdlp.part().run(); //.partファイルを使用する（yt-dlpのデフォルト）
ytdlp.noPart().run(); //.partファイルを使用せずファイルに直接書き込む
```

---

### ファイルの更新日時の指定
ファイルの更新日時を`Last-modified`ヘッダーの値にすることができます。

**関数名**: `mtime()`、`noMtime()`

**yt-dlpのオプション**: `--mtime`、`--no-mtime`

```js
ytdlp.mtime().run(); //更新日時をLast-modifiedヘッダーの値にする（yt-dlpのデフォルト）
ytdlp.noMtime().run(); //更新日時をLast-modifiedヘッダーの値にしない
```

---

### 動画の説明を別ファイルに書き込む
動画の説明を`.description`ファイルに書き込むことができます。

**関数名**: `writeDescription()`、`noWriteDescription()`

**yt-dlpのオプション**: `--write-description`、`--no-write-description`

```js
ytdlp.writeDescription().run(); //.descriptionファイルに書き込む
ytdlp.noWriteDescription().run(); //.descriptionファイルに書き込まない（yt-dlpのデフォルト）
```

---

### 動画のメタデータを別ファイルに書き込む
動画のメタデータを`.info.json`ファイルに書き込むことができます。**（個人情報が含まれる可能性があります。）**

**関数名**: `writeInfoJson()`、`noWriteInfoJson()`

**yt-dlpのオプション**: `--write-info-json`、`--no-write-info-json`

```js
ytdlp.writeInfoJson().run(); //.info.jsonに書き込む
ytdlp.noWriteInfoJson().run(); //.info.jsonに書き込まない（yt-dlpのデフォルト）
```

ファイル名等のプライベートなデータを削除したい場合は以下のオプションを使用します。**（このオプションを使用しても個人情報等が完全に削除されるわけではありません。）**

**関数名**: `cleanInfoJson()`、`noCleanInfoJson()`

**yt-dlpのオプション**: `--clean-info-json`、`--no-clean-info-json`

```js
ytdlp.cleanInfoJson().run(); //プライベートなデータを削除する（yt-dlpのデフォルト）
ytdlp.noCleanInfoJson().run(); //プライベートなデータを削除せずに全てのデータを書き込む
```

---

### プレイリストのメタデータを書き込む
[`writeDescription()`](#動画の説明を別ファイルに書き込む)や[`writeInfoJson()`](#動画のメタデータを別ファイルに書き込む)を使用する際にプレイリストのメタデータも書き込むかを指定できます。

**関数名**: `writePlaylistMetafiles()`、`noWritePlaylistMetafiles()`

**yt-dlpのオプション**: `--write-playlist-metafiles`、`--no-write-playlist-metafiles`

```js
ytdlp.writePlaylistMetafiles().run(); //プレイリストのメタデータを書き込む（yt-dlpのデフォルト）
ytdlp.noWritePlaylistMetafiles().run(); //プレイリストのメタデータを書き込まない
```

---

### コメントを[`.info.json`](#動画のメタデータを別ファイルに書き込む)に書き込む
動画のコメントを[`.info.json`](#動画のメタデータを別ファイルに書き込む)に書き込むことができます。

**関数名**: `writeComments()`、`getComments()`、`noWriteComments()`、`noGetComments()`

**yt-dlpのオプション**: `--write-comments`、`--get-comments`、`--no-write-comments`、`--no-get-comments`

```js
/* コメントを.info.jsonに書き込む（どちらの関数の結果は同じです。） */
ytdlp.writeComments().run();
ytdlp.getComments().run();

/* コメントを.info.jsonに書き込まない（どちらの関数の結果は同じです。） */
ytdlp.noWriteComments().run();
ytdlp.noGetComments().run();
```

---

### [`.info.json`](#動画のメタデータを別ファイルに書き込む)から情報を読み込む
[`.info.json`](#動画のメタデータを別ファイルに書き込む)のファイルパスから動画情報を読み込みます。書き込みは、[`writeInfoJson()`](#動画のメタデータを別ファイルに書き込む)を使用して書き込むことができます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `loadInfoJson()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--load-info-json`

```js
ytdlp.loadInfoJson('File').run();
```

---

### クッキーを読み込む
クッキーを読み込むかを指定できます。読み込む場合は、何かしらの値を指定する必要があります。

**関数名**: `cookies()`、`noCookies()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--cookies`、`--no-cookies`

```js
ytdlp.cookies('File').run(); //クッキーを読み込む
ytdlp.noCookies().run(); //クッキーを読み込まない（yt-dlpのデフォルト）
```

---

### ブラウザからクッキーを読み込む
ブラウザからクッキーを読み込むことができます。読み込む場合は、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#filesystem-options)をご覧ください。

**関数名**: `cookiesFromBrowser()`、`noCookiesFromBrowser()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--cookies-from-browser `、`--no-cookies-from-browser`

```js
ytdlp.cookiesFromBrowser('Browser[+Keyring][:Profile][::Container]').run(); //ブラウザからクッキーを読み込む
ytdlp.noCookiesFromBrowser().run(); //ブラウザからクッキーを読み込まない（yt-dlpのデフォルト）
```

---

### キャッシュの保存先の指定
ダウンロードした情報を永久に保存するディレクトリパスを指定できます。指定する場合は、何かしらの値を指定する必要があります。

**関数名**: `cacheDir()`、`noCacheDir()`、`rmCacheDir()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--cache-dir`、`--no-cache-dir`、`--rm-cache-dir`

```js
ytdlp.cacheDir('Dir').run(); //キャッシュを保存する
ytdlp.noCacheDir().run(); //キャッシュを保存しない
ytdlp.rmCacheDir().run(); //キャッシュを保存せず、すべて削除する
```

---

### サムネイルオプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#thumbnail-options)

---

### サムネイルのダウンロード
サムネイル画像をダウンロードすることができます。`writeAllThumbnails()`を使用すると全ての形式のサムネイル画像がダウンロードされます。

**関数名**: `writeThumbnail()`、`writeAllThumbnails()`、`noWriteThumbnail()`

**yt-dlpのオプション**: `--write-thumbnail`、`--write-all-thumbnails`、`--no-write-thumbnail`

```js
ytdlp.writeThumbnail().run(); //サムネイルをダウンロードする
ytdlp.writeAllThumbnails().run(); //全てのサムネイルをダウンロードする
ytdlp.noWriteThumbnail().run(); //サムネイルをダウンロードしない（yt-dlpのデフォルト）
```

---

### サムネイルのリストアップ
指定された動画の利用可能なサムネイルをリストアップします。

**関数名**: `listThumbnails()`

**yt-dlpのオプション**: `--list-thumbnails`

```js
ytdlp.listThumbnails().run();
```

---

### インターネットショートカットオプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#internet-shortcut-options)

---

### インターネットショートカットの書き込み
インターネットショートカットを書き込むことができます。

**関数名**: `writeLink()`、`writeUrlLink()`、`writeWeblocLink()`、`writeDesktopLink()`

**yt-dlpのオプション**: `--write-link`、`--write-url-link`、`--write-webloc-link`、`--write-desktop-link`

```js
ytdlp.writeLink().run(); //プラットフォームに応じてインターネットショートカットの種類を変えて書き込む
ytdlp.writeUrlLink().run(); //Windowsのインターネットショートカットを書き込む
ytdlp.writeWeblocLink().run(); //MacOSのインターネットショートカットを書き込む
ytdlp.writeDesktopLink().run(); //Linuxのインターネットショートカットを書き込む
```

---

### 冗長性・シミュレーションオプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#verbosity-and-simulation-options)

---

### ログの出力を最小限にする
yt-dlpの出力するログを最小限することができます。このオプションは、[`verbose()`](#デバッグ情報を表示する)と一緒に使用するとログをstderrに出力します。

**関数名**: `quiet()`

**yt-dlpのオプション**: `-q`・`--quiet`

```js
ytdlp.quiet().run();
```

---

### 警告を無視する
yt-dlpによる警告を完全に無視します。

**関数名**: `noWarnings()`

**yt-dlpのオプション**: `--no-warnings`

```js
ytdlp.noWarnings().run();
```

---

### 実行をシミュレートのみにする
`simulate()`を使用するとシミュレートのみが実行され、ダウンロードも書き込みも実行されません。

**関数名**: `simulate()`、`noSimulate()`

**yt-dlpのオプション**: `-s`・`--simulate`、`--no-simulate`

```js
ytdlp.simulate().run(); //シュミレーションのみを実行する
ytdlp.noSimulate().run(); //一覧表示等のオプションを使用しても動画をダウンロードする
```

---

### 「No video formats」エラーを無視する - <div style="background: #6d7034;display: inline;">==実験的==</div>
「No video formats」のエラーを無視することができます。実際にダウンロードできない動画でもメタデータを抽出するのに便利です。

このオプションは**実験的**なオプションです。

**関数名**: `ignoreNoFormatsError()`、`noIgnoreNoFormatsError()`

**yt-dlpのオプション**: `--ignore-no-formats-error`、`--no-ignore-no-formats-error`

```js
ytdlp.ignoreNoFormatsError().run(); //エラーを無視する
ytdlp.noIgnoreNoFormatsError().run(); //エラーを無視しない（yt-dlpのデフォルト）
```

---

### 動画をダウンロードせず、関連ファイルのみを書き込む
動画のダウンロードをスキップし、その他関連ファイルのみを書き込みます。

**関数名**: `skipDownload()`、`noDownload()`

**yt-dlpのオプション**: `--skip-download`・`--no-download`

```js
ytdlp.skipDownload().run();
ytdlp.noDownload().run();
```

---

### テンプレートで指定された動画の諸情報を表示する
シュミレーションするだけだが、テンプレートを使用して指定された動画の諸情報を表示する。このオプションは、複数回指定することができます。

**関数名**: `print()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-O`・`--print`

```js
ytdlp.print('[When:]Template').run();
```

---

### テンプレートで指定された動画の諸情報をファイルに書き込む
シュミレーションするだけだが、テンプレートを使用して指定された動画の諸情報をファイルに書き込むことができます。このオプションは、複数回指定することができます。

**関数名**: `printToFile()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--print-to-file`

```js
ytdlp.printToFile('[When:]Template File').run();
```

---

### 各動画のJSON情報を表示する
各動画のJSON情報を表示します。指定されたURLに対してのJSON情報がほしい場合は、[`dumpSingleJson()`](#URLのJSON情報を表示する)を使用してください。

**関数名**: `dumpJson()`

**yt-dlpのオプション**: `-j`・`--dump-json`

```js
ytdlp.dumpJson().run();
```

---

### URLのJSON情報を表示する
指定されたURLのJSON情報を表示します。各動画のJSON情報がほしい場合は、[`dumpJson()`](#各動画のjson情報を表示する)を使用してください。

**関数名**: `dumpSingleJson()`

**yt-dlpのオプション**: `-J`・`--dump-single-json`

```js
ytdlp.dumpSingleJson().run();
```

---

### シュミレーションオプションが指定されていてもダウンロードアーカイブのエントリーを書き込む
シュミレーションでの実行でもエラーが発生しない限りダウンロードアーカイブにエントリーを記述します。このオプションは、どちらの関数を指定しても同じ結果となります。

**関数名**: `forceWriteArchive()`、`forceDownloadArchive()`

**yt-dlpのオプション**: `--force-write-archive`・`--force-download-archive`

```js
ytdlp.forceWriteArchive().run();
ytdlp.forceDownloadArchive().run();
```

---

### 進捗状況を新しい行に出力する
進捗状況（プログレスバー）を改行して出力できます。

**関数名**: `newline()`

**yt-dlpのオプション**: `--newline`

```js
ytdlp.newline().run();
```

---

### 進捗状況を表示しない
進捗状況を表示したくない場合は、`noProgress()`を使用してください。`progress()`を使用すると[`quiet()`](#ログの出力を最小限にする)が適応されていても進捗状況を表示します。

**関数名**: `noProgress()`、`progress()`

**yt-dlpのオプション**: `--no-progress`、`--progress`

```js
ytdlp.noProgress().run(); //進捗状況を表示しない
ytdlp.progress().run(); //quiet()を適応していても進捗状況を表示する
```

---

### コンソールタイトルを進捗状況にする
コンソールのタイトルバーを進捗状況にすることができます。

**関数名**: `consoleTitle()`

**yt-dlpのオプション**: `--console-title`

```js
ytdlp.consoleTitle().run();
```

---

### 進捗状況のテンプレートを指定する
進捗状況をテンプレートで指定することができます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#verbosity-and-simulation-options)をご覧ください。

**関数名**: `progressTemplate()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--progress-template`

```js
ytdlp.progressTemplate('[Types:]Template').run();
```

---

### デバッグ情報を表示する
ダウンロード等に関する各種デバッグ情報を表示できます。

**関数名**: `verbose()`

**yt-dlpのオプション**: `-v`・`--verbose`

```js
ytdlp.verbose().run();
```

---

### ダウンロードしたページをbase64エンコードしたものを表示する
ダウンロードしたページを、base64エンコードしたものを表示できます。このオプションは、問題のデバッグに使用されます。ファイルに書き込む必要がある場合は、[`writePages()`](#ダウンロードしたページを実行中のディレクトリに書き込む)を使用してください。

**関数名**: `dumpPages()`

**yt-dlpのオプション**: `--dump-pages`

```js
ytdlp.dumpPages().run();
```

---

### ダウンロードしたページを実行中のディレクトリに書き込む
ダウンロードした中間ページをyt-dlpを実行しているディレクトリに書き込みます。このオプションは、問題のデバッグに使用されます。base64でログに出力する必要がある場合は、[`dumpPages()`](#ダウンロードしたページをbase64エンコードしたものを表示する)を使用してください。

**関数名**: `writePages()`

**yt-dlpのオプション**: `--write-pages`

```js
ytdlp.writePages().run();
```

---

### HTTPの送受信トラフィックを表示する
HTTPの送受信トラフィックを表示する必要がある場合は、このオプションを使用してください。

**関数名**: `printTraffic()`

**yt-dlpのオプション**: `--print-traffic`

```js
ytdlp.printTraffic().run();
```

---

### 回避オプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#workarounds)

---

### エンコーディングの指定 - <div style="background: #6d7034;display: inline;">==実験的==</div>
指定されたエンコーディングの使用を強制できます。このオプションには、何かしらの値を指定する必要があります。

このオプションは**実験的**なオプションです。

**関数名**: `encoding()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--encoding`

```js
ytdlp.encoding('Encoding').run();
```

---

### TLS拡張をサポートしていないサーバーへのHTTPS接続を許可する
RFC 5746 secure renegotiationをサポートしないサーバーへのHTTPS接続を許可する必要がある場合は、このオプションを使用してください。

**関数名**: `legacyServerConnect()`

**yt-dlpのオプション**: `--legacyServerConnect`

```js
ytdlp.legacyServerConnect().run();
```

---

### HTTPS証明書の検証をしない
HTTPS証明書の検証をスキップしたい場合は、このオプションを使用してください。

**関数名**: `noCheckCertificates()`

**yt-dlpのオプション**: `--no-check-certificates`

```js
ytdlp.noCheckCertificates().run();
```

---

### 暗号化されていない接続を使用して動画情報を取得する（YouTubeのみのサポート）
暗号化されていない接続を使用して動画情報を取得できます。このオプションは、現在**YouTubeのみのサポート**となっています。

**関数名**: `preferInsecure()`

**yt-dlpのオプション**: `--prefer-insecure`

```js
ytdlp.preferInsecure().run();
```

---

### カスタムHTTPヘッダーの指定
追加してHTTPヘッダーを指定する必要がある場合は、このオプションを使用してください。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#workarounds)をご覧ください。

**関数名**: `addHeaders()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--add-headers`

```js
ytdlp.addHeaders('Field:Value').run();
```

---

### 双方向性テキストに対応していないデバイスを回避する
アラビア語などの右から書く言語等を扱うときにこのオプションを使用してください。詳細は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#workarounds)をご覧ください。

**関数名**: `bidiWorkaround()`

**yt-dlpのオプション**: `--bidi-workaround`

```js
ytdlp.bidiWorkaround().run();
```

---

### データ抽出中のリクエストの間に一時停止する時間の指定
データ抽出中のリクエストの間に一時停止する時間を指定できます。このオプションには、**秒数**を指定してください。

**関数名**: `sleepRequests()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--sleep-requests`

```js
ytdlp.sleepRequests('Seconds').run();
```

---

### ダウンロード前に指定された時間一時停止する
各ダウンロードの前に一時停止する時間を指定できます。このオプションには、**秒数**を指定してください。このオプションと、[`maxSleepInterval()`](#一時停止の最大秒数を指定する)が一緒に使用された場合は一時停止する最小時間となります。

このオプションは、どちらの関数を使用しても同じ結果となります。

**関数名**: `sleepInterval()`・`minSleepInterval()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--sleep-interval`・`--min-sleep-interval`

```js
ytdlp.sleepInterval('Interval').run();
ytdlp.minSleepInterval('Interval').run();
```

---

### 一時停止の最大秒数を指定する
一時停止する時間の最大秒数を指定できます。このオプションには、**秒数**を指定してください。このオプションは、[`sleepInterval()`や`minSleepInterval()`](#ダウンロード前に指定された時間一時停止する)と一緒に使用することが可能です。一緒に使用すると、[`sleepInterval()`や`minSleepInterval()`](#ダウンロード前に指定された時間一時停止する)は**一時停止の最小時間の指定オプション**となります。

**関数名**: `maxSleepInterval()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--max-sleep-interval`

```js
ytdlp.maxSleepInterval('Interval').run();
```

---

### 字幕のダウンロード前の一時停止時間の指定
字幕をダウンロードする際の一時停止秒数を指定できます。このオプションには、**秒数**を指定してください。

**関数名**: `sleepSubtitles()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--sleep-subtitles`

```js
ytdlp.sleepSubtitles('Interval').run();
```

---

### 動画フォーマットオプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#video-format-options)

---

### 動画フォーマットを指定する
ダウンロードする動画の映像・音声等のフォーマットを指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp/tree/master#format-selection)をご覧ください。

**関数名**: `format()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-f`、`--format`

```js
ytdlp.format('Format').run();
```

---

### bestとみなされるフォーマットの判断基準を指定する
「best」とみなされるフォーマットの判断基準を指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp/tree/master#sorting-formats)をご覧ください。

**関数名**: `formatSort()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-S`、`--format-sort`

```js
ytdlp.formatSort('SortOrder').run();
```

この判断基準を**強制したい場合**は以下のオプションを使用してください。指定形式等は上記と同じです。

**関数名**: `formatSortForce()`・`SForce()`、`noFormatSortForce()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--format-sort-force`・`--S-force`、`--no-format-sort-force`

```js
/* 強制する */
ytdlp.formatSortForce().run();
ytdlp.SForce().run();

/* 強制しない（yt-dlpのデフォルト） */
ytdlp.noFormatSortForce().run();
```

---

### 複数の動画ストリームを1つのファイルに統合する
複数の動画ストリームを1つのファイルに統合する必要がある場合は、このオプションを使用してください。`noVideoMultiStreams()`を使用すると1つの動画ストリームに対して1つのファイルがダウンロードされます。

**関数名**: `videoMultiStreams()`、`noVideoMultiStreams()`

**yt-dlpのオプション**: `--video-multistreams`、`--no-video-multistreams`

```js
ytdlp.videoMultiStreams().run(); //複数の動画ストリームを1つのファイルに統合する
ytdlp.noVideoMultiStreams().run(); //複数の動画ストリームを1つのファイルに統合しない（yt-dlpのデフォルト）
```

---

### 複数の音声ストリームを1つのファイルに統合する
複数の音声ストリームを1つのファイルに統合する必要がある場合は、このオプションを使用してください。`noAudioMultiStreams()`を使用すると1つの音声ストリームに対して1つのファイルがダウンロードされます。

**関数名**: `audioMultiStreams()`、`noAudioMultiStreams()`

**yt-dlpのオプション**: `--video-multistreams`、`--no-video-multistreams`

```js
ytdlp.audioMultiStreams().run(); //複数の音声ストリームを1つのファイルに統合する
ytdlp.noAudioMultiStreams().run(); //複数の音声ストリームを1つのファイルに統合しない（yt-dlpのデフォルト）
```

---

### 同じ品質でフリーなフォーマットを優先する
同じ品質でフリーなフォーマットを優先できます。品質に関わりなく優先したい場合は、`formatSort('ext')`を使用します。

**関数名**: `preferFreeFormats()`、`noPreferFreeFormats()`

**yt-dlpのオプション**: `--prefer-free-formats`、`--no-prefer-free-formats`

```js
ytdlp.preferFreeFormats().run(); //優先する
ytdlp.noPreferFreeFormats().run(); //優先しない（yt-dlpのデフォルト）
```

---

### フォーマットをチェックする
動画のフォーマットを利用可能なチェックすることができます。

**関数名**: `checkFormats()`、`checkAllFormats()`、`noCheckFormats()`

**yt-dlpのオプション**: `--check-formats`、`--check-all-formats`、`--no-check-formats`

```js
ytdlp.checkFormats().run(); //選択されているフォーマットが利用可能かを確認する
ytdlp.checkAllFormats().run(); //全てのフォーマットが利用可能かを確認する
ytdlp.noCheckFormats().run(); //利用可能なフォーマットであることを確認しない（yt-dlpのｄエフォート）
```

---

### 利用可能なフォーマットをリストアップする
動画の利用可能なフォーマットをリストアップできます。

**関数名**: `listFormats()`

**yt-dlpのオプション**: `--list-formats`

```js
ytdlp.listFormats().run();
```

---

### 動画のマージに使用するコンテナを指定する
動画をマージする際に使用するコンテナを指定できます。現時点では、「avi・flv・mkv・mov・mp4・webm」がサポートされています。マージする必要がない場合は、無視されます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `mergeOutputFormat()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--merge-output-format`

```js
ytdlp.mergeOutputFormat().run();
```

---

### 字幕オプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#subtitle-options)

---

### 字幕ファイルを書き込む
字幕ファイルをディスクに書き込む必要がある場合は、このオプションを使用してください。

**関数名**: `writeSubs()`、`noWriteSubs()`

**yt-dlpのオプション**: `--write-subs`、`--no-write-subs`

```js
ytdlp.writeSubs().run(); //字幕ファイルを書き込む
ytdlp.noWriteSubs().run(); //字幕ファイルを書き込まない（yt-dlpのデフォルト）
```

自動生成された字幕を書き込む必要がある場合は、以下のオプションを使用してください。

**関数名**: `writeAutoSubs()`・`writeAutomaticSubs()`、`noWriteAutoSubs()`・`noWriteAutomaticSubs()`

**yt-dlpのオプション**: `--write-auto-subs`・`--write-automatic-subs`、`--no-write-auto-subs`・`--no-write-automatic-subs`

```js
/* 自動生成された字幕を書き込む */
ytdlp.writeAutoSubs().run();
ytdlp.writeAutomaticSubs().run();

/* 自動生成された字幕を書き込まない（yt-dlpのデフォルト） */
ytdlp.noWriteAutoSubs().run();
ytdlp.noWriteAutomaticSubs().run();
```

---

### 利用可能な字幕をリストアップする
指定された動画で利用可能な字幕をリストアップできます。

**関数名**: `listSubs()`

**yt-dlpのオプション**: `--list-subs`

```js
ytdlp.listSubs().run();
```

---

### 字幕フォーマットを指定する
フォーマットの優先順位を指定することができます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `subFormat()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-sub-format`

```js
ytdlp.subFormat('Format').run();
```

---

### ダウンロードする字幕の言語を指定する
ダウンロードする字幕の言語を指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#subtitle-options)をご覧ください。

**関数名**: `subLangs()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--sub-langs`

```js
ytdlp.subLangs('Regex').run();
```

---

### 認証オプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#authentication-options)

---

### ログイン時の設定
ログイン時に、ユーザー名とパスワードを指定できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `username()`、`password()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-u`・`--username`、`-p`・`--password`

```js
ytdlp.username('Username').run(); //ユーザー名の指定
ytdlp.password('Password').run(); //パスワードの指定
```

---

### 二要素認証コードを指定する
二要素認証コードを指定することができます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `twofactor()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-2`・`--twofactor`

```js
ytdlp.twofactor('Code').run();
```

---

### .netrc 認証データを使用する
.netrc 認証データを使用したい場合は、このオプションを使用してください。

**関数名**: `netrc()`

**引数の型**: `String型`

**yt-dlpのオプション**: `-n`・`--netrc`

```js
ytdlp.netrc().run();
```

.netrc 認証データの場所を既定（~/.netrc）から変更したい場合は、以下のオプションを使用してください。

**関数名**: `netrcLocation()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--netrc-location`

```js
ytdlp.netrcLocation('Path').run();
```
---

### 動画のパスワードを指定する
動画のパスワードを指定する必要がある場合は、このオプションを使用してください。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `videoPassword()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--video-password`

```js
ytdlp.videoPassword('Password').run();
```

---

### Adobe PrimetimeのTVプロバイダーのIDの指定
Adobe PrimetimeのTVプロバイダーのIDを指定できます。このオプションには、何かしらの値を指定する必要があります。TVプロバイダーのIDをリストアップしたい場合は、[`apListMso()`](#adobe-primetimeのtvプロバイダーのidをリストアップする)を使用してください。

**関数名**: `apMso()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--ap-mso`

```js
ytdlp.apMso('Mso').run();
```

---

### Adobe Primetimeへのログイン設定
Adobe Primetimeへのログイン時に、ユーザー名とパスワードを指定できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `apUsername()`、`apPassword()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--ap-username`、`--ap-password`

```js
ytdlp.apUsername('Username').run(); //ユーザー名の指定
ytdlp.apPassword('Password').run(); //パスワードの指定
```

---

### Adobe PrimetimeのTVプロバイダーのIDをリストアップする。
Adobe PrimetimeのTVプロバイダーのIDをリストアップできます。

**関数名**: `apListMso()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--ap-list-mso`

```js
ytdlp.apListMso().run();
```

---

### PEM形式のクライアント証明書ファイルのパスを指定する
PEM形式のクライアント証明書ファイルのパスを指定できます。このオプションには、何かしらの値を指定する必要があります。秘密鍵を指定したい場合は、[`clientCertificateKey()`](#クライアント証明書用の秘密鍵へのファイルパスを指定する)を使用してください。

**関数名**: `clientCertificate()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--client-certificate`

```js
ytdlp.clientCertificate('Path').run();
```

---

### クライアント証明書用の秘密鍵へのファイルパスを指定する
[`clientCertificate()`](#PEM形式のクライアント証明書ファイルのパスを指定する)で指定された証明書の秘密鍵ファイルのパスを指定します。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `clientCertificateKey()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--client-certificate-key`

```js
ytdlp.clientCertificateKey('Path').run();
```

---

### 秘密鍵のパスワードを指定する
[`clientCertificateKey()`](#クライアント証明書用の秘密鍵へのファイルパスを指定する)で指定された秘密鍵にパスワードが存在する場合は、このオプションを使用してください。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `clientCertificatePassword()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--client-certificate-password`

```js
ytdlp.clientCertificatePassword('Password').run();
```

---

### ポストプロセッサーオプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#post-processing-options)

---

### 動画を音声のみにする
動画が含まれるファイルを音声のみに変換できます。このオプションで必要なffmpegとffprobeはこのAPIによって自動でダウンロードされます。

変換先のフォーマットを指定したい場合は、[`audioFormat()`](#音声へ変換後のフォーマットを指定する)を使用し、音声品質を指定したい場合は、[`audioQuality()`](#音声へ変換する際の品質を指定する)を使用してください。

**関数名**: `extractAudio()`

**yt-dlpのオプション**: `-x`・`--extract-audio`

```js
ytdlp.extractAudio().run();
```

---

### 音声へ変換後のフォーマットを指定する
[`extractAudio()`](#動画を音声のみにする)を使用して変換された後の音声ファイルのフォーマットを指定できます。このオプションには、「best・aac・alac・flac・m4a・mp3・opus・vorbis・wav」のいずれかを指定する必要があります。（bestがyt-dlpのデフォルト）

**関数名**: `audioFormat()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--audio-format`

```js
ytdlp.audioFormat('Format').run();
```

---

### 音声へ変換する際の品質を指定する
[`extractAudio()`](#動画を音声のみにする)を使用して変換された後の音声ファイルの品質を指定できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `audioQuality()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--audio-quality`

```js
ytdlp.audioQuality('Quality').run();
```

---

### 動画を別のコンテナへ再マックス（変換）する
必要に応じて動画を別のコンテナへ再マックスできます。このオプションには、「avi・flv・gif・mkv・mov・mp4・webm・aac・aiff・alac・flac・m4a・mka・mp3・ogg・opus・vorbis・wav」のいずれかを指定する必要があります。指定されたコンテナが動画・音声コーデックをサポートしていない場合、処理は失敗します。

**関数名**: `remuxVideo()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--remux-video`

```js
ytdlp.remuxVideo('Format').run();
```

---

### 動画を別のフォーマットに再エンコードする
動画を別のフォーマットに再エンコードできます。このオプションには、何かしらの値を指定する必要があります。指定形式は、[`remuxVideo()`](#動画を別のコンテナへ再マックス（変換）する)と同じです。

**関数名**: `recodeVideo()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--recode-video`

```js
ytdlp.recodeVideo('Format').run();
```

---

### ポストプロセッサーに引数を渡す
ポストプロセッサーに引数を渡すことができます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#post-processing-options)をご覧ください。

このオプションは、どちらの関数を使用しても同じ結果となります。

**関数名**: `postProcessorArgs()`、`ppa()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--postprocessor-args`・`--ppa`

```js
ytdlp.postProcessorArgs('Name:Args').run();
ytdlp.ppa('Name:Args').run();
```

---

### ダウンロードした変換前のファイルを残す
ダウンロードした変換前のファイルを残すことができます。

**関数名**: `keepVideo()`、`noKeepVideo()`

**yt-dlpのオプション**: `-k`・`--keep-video`、`--no-keep-video`

```js
ytdlp.keepVideo().run(); //変換前のファイルを残す
ytdlp.noKeepVideo().run(); //変換前のファイルを残さない（yt-dlpのデフォルト）
```

---

### 変換後のファイルを上書きする
変換後のファイルを上書きできます。

**関数名**: `postOverwrites()`、`noPostOverwrites()`

**yt-dlpのオプション**: `--post-overwrites`、`--no-post-overwrites`

```js
ytdlp.postOverwrites().run(); //上書きする（yt-dlpのデフォルト）
ytdlp.noPostOverwrites().run(); //上書きしない
```

---

### 動画に字幕を埋め込む（mp4、webm、mkvのみ）
動画に字幕を埋め込むことができます。（mp4、webm、mkvのみ対応）

**関数名**: `embedSubs()`、`noEmbedSubs()`

**yt-dlpのオプション**: `--embed-subs`、`--no-embed-subs`

```js
ytdlp.embedSubs().run(); //字幕を埋め込む
ytdlp.noEmbedSubs().run(); //字幕を埋め込まない（yt-dlpのデフォルト）
```

---

### 動画にサムネイルを埋め込む
動画のサムネイルをカバーアートとして埋め込むことができます。

**関数名**: `embedThumbnail()`、`noEmbedThumbnail()`

**yt-dlpのオプション**: `--embed-thumbnail`、`--no-embed-thumbnail`

```js
ytdlp.embedThumbnail().run(); //サムネイルを埋め込む
ytdlp.noEmbedThumbnail().run(); //サムネイルを埋め込まない（yt-dlpのデフォルト）
```

---

### 動画ファイルにメタデータを埋め込む
動画ファイルにメタデータを埋め込むことができます。

**関数名**: `embedMetadata()`・`addMetadata()`、`noEmbedMetadata()`・`noAddMetadata()`

**yt-dlpのオプション**: `--embed-metadata`・`--add-metadata`、`--no-embed-metadata`・`--no-add-metadata`

```js
/* メタデータを埋め込む */
ytdlp.embedMetadata().run();
ytdlp.addMetadata().run();

/* メタデータを埋め込まない（yt-dlpのデフォルト） */
ytdlp.noEmbedMetadata().run();
ytdlp.noAddMetadata().run();
```

---

### 動画ファイルにチャプターを埋め込む
動画ファイルにチャプターを埋め込むことができます。

**関数名**: `embedChapters()`・`addChapters()`、`noEmbedChapters()`・`noAddChapters()`

**yt-dlpのオプション**: `--embed-chapters`・`--add-chapters`、`--no-embed-chapters`・`--no-add-chapters`

```js
/* チャプターを埋め込む */
ytdlp.embedChapters().run();
ytdlp.addChapters().run();

/* チャプターを埋め込まない（yt-dlpのデフォルト） */
ytdlp.noEmbedChapters().run();
ytdlp.noAddChapters().run();
```

---

### mkv・mkaにinfoJsonを埋め込む
mkv・mkaにinfoJsonを埋め込むことができます。

**関数名**: `embedInfoJson()`、`noEmbedInfoJson()`

**yt-dlpのオプション**: `--embed-info-json`、`--no-embed-info-json`

```js
ytdlp.embedInfoJson().run(); //埋め込む
ytdlp.noEmbedInfoJson().run(); //埋め込まない
```

---

### フィールドからメタデータを解析する
フィールドからタイトル等のメタデータを解析できます。このオプションには、何かしらの値を指定する必要があります。詳細は、[メタデータの変更](https://github.com/yt-dlp/yt-dlp#modifying-metadata)をご覧ください。

**関数名**: `parseMetadata()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--parse-metadata`

```js
ytdlp.parseMetadata('[When:]From:To').run();
```

---

### 正規表現でメタデータを書き換える
正規表現でメタデータを書き換えることができます。このオプションには、何かしらの値を指定する必要があります。このオプションは、複数回の指定が可能です。

**関数名**: `replaceInMetadata()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--replace-in-metadata`

```js
ytdlp.replaceInMetadata('[When:]Fields Regex Replace').run();
```

---

### 拡張ファイル属性にメタデータを書き込む
拡張ファイル属性にメタデータを書き込むことができます。

**関数名**: `xattrs()`

**yt-dlpのオプション**: `--xattrs`

```js
ytdlp.xattrs().run();
```

---

### プレイリスト内の動画を連結する
プレイリスト内の動画を連結できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#post-processing-options)をご覧ください。

**関数名**: `concatPlaylist()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--concat-playlist`

```js
ytdlp.concatPlaylist('Policy').run();
```

---

### 既知の不具合等を自動で修正する
既知の不具合等を自動で修正できます。このオプションには、「never・warn・detect_or_warn・force」のいずれかを指定する必要があります。詳細については[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#post-processing-options)をご覧ください。

**関数名**: `fixup()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--fixup`

```js
ytdlp.fixup('Policy').run();
```

---

### ffmpegのバイナリディレクトリの指定
ffmpegのバイナリディレクトリを指定する必要がある場合は、このオプションを使用します。

**情報**: ffmpegはこのAPIによって自動でダウンロードされるため何か理由がある場合を除き、指定する必要はありません。

**関数名**: `ffmpegLocation()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--ffmpeg-location`

```js
ytdlp.ffmpegLocation('Path').run();
```

---

### ダウンロード後にコマンドを実行する
動画のダウンロード後にコマンドを実行することができます。詳細については[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#post-processing-options)をご覧ください。

**関数名**: `exec()`、`noExec()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--exec`、`--no-exec`

```js
ytdlp.exec('[When:]Cmd').run(); //コマンドを定義する
ytdlp.noExec().run(); //exec()で定義された物を削除する
```

---

### 字幕を他のフォーマットに変換する
字幕を他のフォーマットに変換できます。このオプションには、「ass・lrc・srt・vtt」のいずれかを指定する必要があります。

**関数名**: `convertSubs()`・`convertSubtitles()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--convert-subs`・`--convert-subtitles`

```js
ytdlp.convertSubs('Format').run();
ytdlp.convertSubtitles('Format').run();
```

---

### サムネイルを他のフォーマットに変換する
サムネイルを他のフォーマットに変換できます。このオプションには、「jpg・png・webp」のいずれかを指定する必要があります。詳細は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#post-processing-options)をご覧ください。

**関数名**: `convertThumbnails()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--convert-thumbnails`

```js
ytdlp.convertThumbnails('Format').run();
```

---

### チャプターごとにファイルを分割する
動画のチャプターごとにファイルを分割できます。

**関数名**: `splitChapters()`、`noSplitChapters()`

**yt-dlpのオプション**: `--split-chapters`、`--no-split-chapters`

```js
ytdlp.splitChapters().run(); //チャプターごとにファイルを分割する
ytdlp.noSplitChapters().run(); //チャプターごとにファイルを分割しない（yt-dlpのデフォルト）
```

---

### 正規表現に一致するチャプターを削除する
指定された正規表現に一致するチャプターを削除できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[`downloadSections()`](#一致するチャプターのみダウンロードする)と同じです。

**関数名**: `removeChapters()`、`noRemoveChapters()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--remove-chapters`、`--no-remove-chapters`

```js
ytdlp.removeChapters('Regex').run(); //チャプターを削除する
ytdlp.noRemoveChapters().run(); //チャプターを削除しない（yt-dlpのデフォルト）
```

---

### チャプターを削除・追加する際にkeyframeを設定し直す
チャプターを削除・追加する際にkeyframeを設定し直すことができます。

**関数名**: `forceKeyframesAtCuts()`、`noForceKeyframesAtCuts()`

**yt-dlpのオプション**: `--force-keyframes-at-cuts`、`--no-force-keyframes-at-cuts`

```js
ytdlp.forceKeyframesAtCuts().run(); //設定し直す
ytdlp.noForceKeyframesAtCuts().run(); //設定し直さない（yt-dlpのデフォルト）
```

---

### 有効にするポストプロセッサープラグインを指定する
大文字・小文字を区別して有効にするポストプロセッサープラグインの名前を指定できます。このオプションには、何かしらの値を指定する必要があります。指定形式は[yt-dlpの公式ドキュメント](https://github.com/yt-dlp/yt-dlp#post-processing-options)をご覧ください。

**関数名**: `usePostProcessor()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--use-postprocessor`

```js
ytdlp.usePostProcessor('Name[:Args]').run();
```

---

### SponsorBlockオプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#sponsorblock-options)

---

### SponsorBlock APIを使用してチャプターを書き込む
SponsorBlock APIを使用してチャプターを書き込むことができます。このオプションには、何かしらのカテゴリを指定する必要があります。指定できるカテゴリは、「sponsor・intro・outro・selfpromo・preview・filler・interaction・music_offtopic・poi_highlight・all」です。このカテゴリの説明については、[Segment Categories](https://wiki.sponsor.ajay.app/index.php/Segment_Categories)をご覧ください。

**関数名**: `sponsorBlockMark()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--sponsorblock-mark`

```js
ytdlp.sponsorBlockMark('Cats').run();
```

ここで指定されたチャプターを削除したい場合は、以下のオプションを使用してください。

**関数名**: `sponsorBlockRemove()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--sponsorblock-remove`

```js
ytdlp.sponsorBlockRemove('Cats').run();
```
---

### [`sponsorBlockMark()`](#sponsorblock-apiを使用してチャプターを書き込む)で設定されたチャプターのタイトルテンプレートを指定する
[`sponsorBlockMark()`](#sponsorblock-apiを使用してチャプターを書き込む)で設定されたチャプターのタイトルテンプレートを指定できます。このオプションには、何かしらの値を指定する必要があります。利用可能な値は、「start_time・end_time・category・categories・name・category_names」です。

**関数名**: `sponsorBlockChapterTitle()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--sponsorblock-chapter-title`

```js
ytdlp.sponsorBlockChapterTitle('Template').run();
```

---

### SponsorBlockの特定のオプションを無効にする
[`sponsorBlockMark()`](#sponsorblock-apiを使用してチャプターを書き込む)と[`sponsorBlockRemove()`](#sponsorblock-apiを使用してチャプターを書き込む)を無効にできます。

**関数名**: `noSponsorBlock()`

**yt-dlpのオプション**: `--no-sponsorblock`

```js
ytdlp.noSponsorBlock().run();
```

---

### SponsorBlock APIのURLを指定する
SponsorBlock APIのURLを指定できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `sponsorBlockApi()`

**yt-dlpのオプション**: `--sponsorblock-api`

```js
ytdlp.sponsorBlockApi().run();
```

---

### Extractor オプション - [公式ドキュメント](https://github.com/yt-dlp/yt-dlp#sponsorblock-options)

---

### Extractorのエラーに対する再試行回数の指定
Extractorのエラーに対する再試行回数を指定できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `extractorRetries()`

**引数の型**: `String型`、`Number型`

**yt-dlpのオプション**: `--extractor-retries`

```js
ytdlp.extractorRetries('Retries').run();
```

---

### ライブストリーム（ダイナミック）DASHマニフェストを処理する
ライブストリーム（ダイナミック）DASHマニフェストを処理できます。

**関数名**: `allowDynamicMpd()`・`noIgnoreDynamicMpd()`、`ignoreDynamicMpd()`・`noAllowDynamicMpd()`

**yt-dlpのオプション**: `--allow-dynamic-mpd`・`--no-ignore-dynamic-mpd`、`--ignore-dynamic-mpd`・`--no-allow-dynamic-mpd`

```js
//ライブストリーム（ダイナミック）DASHマニフェストを処理する（yt-dlpのデフォルト）
ytdlp.allowDynamicMpd().run();
ytdlp.noIgnoreDynamicMpd().run();

//ライブストリーム（ダイナミック）DASHマニフェストを処理しない
ytdlp.ignoreDynamicMpd().run();
ytdlp.noAllowDynamicMpd().run();
```

---

### HLS形式の動画を不連続部分で異なるフォーマットに分割する
HLS形式の動画を広告などの不連続部分で異なるフォーマットに分割することができます。

**関数名**: `hlsSplitDiscontinuity()`、`noHlsSplitDiscontinuity()`

**yt-dlpのオプション**: `--hls-split-discontinuity`、`--no-hls-split-discontinuity`

```js
ytdlp.hlsSplitDiscontinuity().run(); //異なるフォーマットに分割する
ytdlp.noHlsSplitDiscontinuity().run(); //異なるフォーマットに分割しない（yt-dlpのデフォルト）
```

---

### Extractorへ引数を渡す
Extractorへ引数を渡すことができます。このオプションには、何かしらの値を指定する必要があります。このオプションは、複数回の指定が可能です。

**関数名**: `extractorArgs()`

**引数の型**: `String型`

**yt-dlpのオプション**: `--extractor-args`

```js
ytdlp.extractorArgs('IE_Key:Args').run();
```

---

## ライセンス
このAPIは、MITライセンスで公開されています。詳細はLICENSEファイルまたは以下のライセンス文をご覧ください。

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
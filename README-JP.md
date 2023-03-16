<div align="center">

# Node.js用のyt-dlp API - fluent-ytdlp

**Node.jsで簡単にyt-dlpを実行します。独自のコードを作成する必要はありません。**

このプロジェクトは、[fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg)を参考に作成されました。
</div>

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

このAPIは、実行（`exec()`を実行）するとNode.jsのChildProcessでストリームを返します。<br>
ストリーム以外での実行は[ストリーム以外での実行](#ストリーム以外での実行)をご覧ください。

その他使用方法については、exampleフォルダをご覧ください。

### モジュールの読み込みとURLの指定

```js
const fluentYTDlp = require('fluent-ytdlp'); //モジュールの読み込み
const ytdlp = new fluentYTDlp('<URL>');
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

### ストリーム以外での実行
ストリーム以外での実行が必要な場合は、以下のオプション（`noStream()`）を使用してください。このオプションは、指定しない場合と比べて不安定な場合があります。

```js
const ytdlpProcess = ytdlp.noStream().exec(); //オプションなし
const ytdlpProcess = ytdlp.resolution('1920x1080').noStream().exec(); //オプションあり

console.log(ytdlpProcess); //yt-dlpの実行結果の表示
```

## オプション説明

### オプションに関する情報
オプションの関数名は、全てyt-dlpでも同じオプション名となっています。<br>
例外として、オプション名の最初にアンダーバー（`_`）がある場合はyt-dlpには存在しないオプションとなります。

**注意: yt-dlpで非推奨になったオプション等は`otherOptions()`で指定することが可能ですが、動作については保証できません。**

---

### yt-dlpのメタ情報に関するオプション

---

### ヘルプの取得
yt-dlpの`--help`オプションを使用することで表示される情報を返します。この情報に改行を含ませない場合は、引数に`true`を指定します。<br>
改行を含ませる場合は、`false`を指定するか何も指定しないでください。

**関数名**: `help()`

```js
/* 改行あり */
ytdlp.help();
ytdlp.help(false);

/* 改行なし */
ytdlp.help(true);
```

---

### バージョンの取得
yt-dlpの`--version`で取得されるバージョンを返します。

**関数名**: `version()`

```js
ytdlp.version();
```

---

### yt-dlpのアップデート
yt-dlpの`--update`を実行します。アップデートが完了しているかの確認は`_updateCompleted()`を実行します。

**関数名**: `update()`

```js
ytdlp.update();
```

#### _updateCompleted
アップデートが完了している場合は`true`を返し、その他の場合は、`false`を返します。

**関数名**: `_updateCompleted()`

```js
ytdlp._updateCompleted();
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
URLを途中で変更することができます。このオプションは複数回指定することができ、一番最後に指定されたオプションが適応されます。

**関数名**: `url()`

```js
ytdlp.url('<URL>').exec();
```

---

### ダウンロードエラーの無視
yt-dlpによるダウンロードプロセスが、エラー等で失敗したとしても成功とみなすようにします。

**関数名**: `ignoreErrors()`

```js
ytdlp.ignoreErrors().exec();
```

---

### userAgentの取得
userAgentを取得できます。このオプションを指定するとその他のオプションを指定できなくなり、動画のダウンロードは実行されません。

**関数名**: `dumpUserAgent()`

```js
ytdlp.dumpUserAgent().exec();
```

---

### extractor一覧の取得
extractorの一覧を配列で取得できます。このオプションを指定するとその他のオプションを指定できなくなり、動画のダウンロードは実行されません。

**関数名**: `listExtractors()`

```js
ytdlp.listExtractors().exec();
```

---

### extractor一覧を説明付きで取得
extractorの一覧と説明を配列で取得できます。このオプションを指定するとその他のオプションを指定できなくなり、動画のダウンロードは実行されません。

**関数名**: `extractorDescriptions()`

```js
ytdlp.extractorDescriptions().exec();
```

---

### 使用するextractorの指定
ダウンロード等に使用するextractorを指定します。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `useExtractors()`

```js
ytdlp.useExtractors('Extractor Name').exec();
```

---

### URLではない値をURLとして指定された場合の処理の指定
URLではない値を、URLとして与えられた場合の処理を指定できます。このオプションには、何かしらの値を指定する必要があります。

**関数名**: `defaultSearch()`

```js
ytdlp.defaultSearch('Method').exec();
```

---

### 設定ファイルまたは、フォルダパスの指定
設定ファイルのパス、フォルダのパスを指定できます。このオプションには、何かしらの値を指定する必要があります。この設定ファイルのみを適応する場合は、[設定ファイルを限定する](#設定ファイルを限定する)をご覧ください。

**関数名**: `configLocation()`

```js
ytdlp.configLocation('PATH').exec();
```

---

### 設定ファイルの限定
`configLocation('PATH')`を使用して指定した設定ファイル以外を適応しない場合は、`ignoreConfig()`または`noConfig()`を使用してください。<br>

**関数名**: `ignoreConfig()`、`noConfig()`

```js
ytdlp.ignoreConfig().exec();
ytdlp.noConfig().exec();
```

---

### 全ての設定ファイルの無視
どのようなオプションで設定ファイルを指定されてもその設定ファイルを無視します。このオプションを指定するとその他の設定ファイルに関するオプションが指定できなくなります。

**関数名**: `noConfigLocations()`

```js
ytdlp.noConfigLocations().exec();
```

---

### プレイリスト展開
プレイリストの展開をするかを指定できます。

**関数名**: `flatPlaylist()`, `noFlatPlaylist()`

```js
ytdlp.flatPlaylist().exec();
ytdlp.noFlatPlaylist().exec();
```

---

### ライブのダウンロード開始を放送開始時にする - ~実験的~
YouTubeのライブを放送開始時からにするかを指定できます。

**関数名**: `liveFromStart()`, `noLiveFromStart()`

```js
ytdlp.liveFromStart().exec();
ytdlp.noLiveFromStart().exec();
```

---

### ライブの予約ダウンロード待機中の再試行間隔の指定
ライブの予約ダウンロードの待機中の再試行間隔を指定できます。指定する場合は、**秒数**を指定してください。

**関数名**: `waitForVideo()`, `noWaitForVideo()`

```js
ytdlp.waitForVideo().exec();
ytdlp.noWaitForVideo().exec();
```

---

### 再生履歴の追加
再生履歴を残すことができます。このオプションはユーザー名・パスワードを指定しないと動作しません。

**関数名**: `markWatched()`, `noMarkWatched()`

```js
ytdlp.markWatched().exec();
ytdlp.noMarkWatched().exec();
```

---

### 出力にカラーコードを生成しない
このオプションを指定すると標準出力にカラーコードを生成しなくなります。

**関数名**: `noColor()`

```js
ytdlp.noColor().exec();
```

---

### 各オプションの動作の違いの修正
各オプションのデフォルト動作の違いを元に戻すことができます。

**関数名**: `compatOptions()`

```js
ytdlp.compatOptions().exec();
```

***

### ~~オプションエイリアスの作成~~ - 利用できません。
**注意:  正常に動作しない可能性があるため利用できません。改善策が見つかり次第、利用を可能にします。**

オプション文字列のエイリアスを作成できます。エイリアスの引数はPythonの文字列フォーマットにしたがってパースされます。

**関数名**: `alias()`

```js
ytdlp.alias('alias').exec();
```

---

### ネットワークオプション

---

## ライセンス
このプロジェクトは、MITライセンスで公開されています。詳細はLICENSEファイルをご覧ください。
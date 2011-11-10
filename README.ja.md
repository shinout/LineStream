LineStream.js 0.2.4
==========
[Node.js] データ１行ごとに処理できるようにするEventEmitter

変更履歴

----------------
* [0.0.1]: リリース
* [0.0.2]: npmに登録。
* [0.1.0]: ReadableStreamのインターフェイスを実装
* [0.2.0]: resume()で再開できるようにした
* [0.2.1]: pause()で処理をとめられるようにした
* [0.2.2]: trimのデフォルト値をtrueにした
* [0.2.3]: setEncoding('utf8')にした
* [0.2.4]: trimがtrueのときは最後の改行後の値をemitしないようにした

概要
----------------
### 要するに？ ###
    データ１行ごとに処理できるようにするEventEmitter. データはファイルまたはStream。
    
    var stream = new LineStream(__filename);
    stream.on('data', function(line){
      console.log(line);
    });


### インストール方法 ###
    git clone git://github.com/shinout/LineStream.git

    OR

    npm install linestream

### 使い方 ###
#### ファイルを扱う ####
    var LineStream = require('/path/to/LineStream');
    var stream = new LineStream(filename, {bufferSize: 300});

    stream.on('data', function(line, isEnd) {
      console.log(line); // 各行がここに入ります
      console.log(isEnd); // if it is the end of data or not.
    });

    stream.on('end', function() { // ファイルの終わりに実行されます。
      console.log('end');
    });

    stream.on('error', function(e) { // エラー発生時に呼び出されます。
      console.log(e);
    });



#### Streamオブジェクトを扱う (例：HttpResponse) ####
    var https = require('https');
    var req = https.request({host: 'github.com'}, function(response) {
      var stream = new LineStream(response);

      stream.on('data', function(line) {
        console.log(line); // 各行がここに入ります
      });

      stream.on('end', function() { // responseの終わりに実行されます。
        console.log('end'); 
      });

      stream.on('error', function(e) { // エラー発生時に呼び出されます。
        console.log(e);
      });
    });
    req.end();

#### パイプ  ####
    var stream = new LineStream(__filename);
    stream.pipe(process.stderr);

### 注意 ###
* 現在のところ、CRまたはCRLFを改行文字とする場合、その旨を以下のように指定する必要があります。
    var stream = new LineStream(filename, {separator: '\r'});   //CR
    var stream = new LineStream(filename, {separator: '\r\n'}); // CRLF
LineStream.js 0.0.2
==========
[Node.js] データ１行ごとに処理できるようにするEventEmitter

変更履歴

----------------
* [0.0.1]: リリース
* [0.0.2]: npmに登録。

概要
----------------
### 要するに？ ###
    データ１行ごとに処理できるようにするEventEmitter. データはファイルまたはStream。
    
    var stream = new LineStream(file);
    stream.on('line', function(line){
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

    stream.on('line', function(line) {
      console.log(line); // 各行がここに入ります
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

      stream.on('line', function(line) {
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


### 注意 ###
* 現在のところ、CRまたはCRLFを改行文字とする場合、その旨を以下のように指定する必要があります。
    var stream = new LineStream(filename, {separator: '\r'});   //CR
    var stream = new LineStream(filename, {separator: '\r\n'}); // CRLF
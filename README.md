LineStream.js 0.2.9
==========
[Node.js] EventEmitter which emits read-line events

Change Log

----------------
* [0.0.1]: Release
* [0.0.2]: Registered to npm
* [0.1.0]: Implemented the interface of ReadableStream
* [0.2.0]: Implemented resume()
* [0.2.1]: Implemented pause()
* [0.2.2]: the default value of options.trim be true
* [0.2.3]: setEncoding('utf8') to given streams
* [0.2.4]: if option.trim, the value after the last \n is not emitted.
* [0.2.5]: implemented filter function with fieldSep, fieldNum, empty, comment and filter()
* [0.2.8]: LineStream.create() : for simple use
* [0.2.9]: LineStream.tsv()

Overview
----------------
### What's this? ###
    A simple EventEmitter which emits read-line events
    
    var stream = new LineStream(__filename);
    stream.on('data', function(line){
      console.log(line);
    });


### Installation ###
    git clone git://github.com/shinout/LineStream.git

    OR

    npm install linestream

### Usage ###
#### with file ####
    var LineStream = require('/path/to/LineStream');
    var stream = new LineStream(filename, {bufferSize: 300});

    stream.on('data', function(line, isEnd) {
      console.log(line); // each line comes here
      console.log(isEnd); // if it is the end of data or not.
    });

    stream.on('end', function() { // emitted at the end of file
      console.log('end');
    });

    stream.on('error', function(e) { // emitted when an error occurred
      console.log(e);
    });



#### with Stream (like HttpResponse) ####
    var https = require('https');
    var req = https.request({host: 'github.com'}, function(response) {
      var stream = new LineStream(response);

      stream.on('data', function(line) {
        console.log(line); // each line comes here
      });

      stream.on('end', function() { // emitted at the end of response
        console.log('end'); 
      });

      stream.on('error', function(e) { // emitted when an error occurred
        console.log(e);
      });
    });
    req.end();

#### pipe  ####
    var stream = new LineStream(__filename);
    stream.pipe(process.stderr);

### Notice ###
* Currently, if you'd like to set CR or CRLF as a line separator, 
you need to set the option like belows.
    var stream = new LineStream(filename, {separator: '\r'});   //CR
    var stream = new LineStream(filename, {separator: '\r\n'}); // CRLF
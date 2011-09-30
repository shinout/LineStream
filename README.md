LineStream.js 0.2.1
==========
[Node.js] EventEmitter which emits read-line events

Change Log

----------------
* [0.0.1]: Release
* [0.0.2]: Registered to npm
* [0.1.0]: Implemented the interface of ReadableStream

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

    stream.on('data', function(line) {
      console.log(line); // each line comes here
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
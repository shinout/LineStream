LineStream.js
==========
[Node.js] ReadableStream of lines

## Installation ##

    $ npm install linestream

    OR

    $ git clone git://github.com/shinout/LineStream.git

## sample ##

### with file ###

    var stream = require('linestream').create(filename, {bufferSize: 300});

    stream.on('data', function(line, isEnd) {
      console.log(line); // each line comes here
      console.log(isEnd); // if it is the end of data or not.
    })

    stream.on('end', function() { // emitted at the end of file
      console.log('end');
    });

    stream.on('error', function(e) { // emitted when an error occurred
      console.log(e);
    });


### with Stream (like HttpResponse) ###

    var https = require('https');
    var req = https.request({host: 'github.com'}, function(response) {
      var stream = require('linestream').create(response);

      stream.on('data', function(line) {
        console.log(line); // each line comes here
      });
    });
    req.end();

## API Documentation ##

### Notice ###
* Currently, if you'd like to set CR or CRLF as a line separator, 
you need to set the option like belows.
    var stream = new LineStream(filename, {separator: '\r'});   //CR
    var stream = new LineStream(filename, {separator: '\r\n'}); // CRLF





LineStream: constructor

@implements ReadableStream

@param arg string : file path
       arg Stream : stream

@param op object 
        separator string   : line separator. default: '\n'
        trim      boolean  : if true, not add a line separator to the end of line. default true.
        pause     boolean  : if true, not emitting lines unless resume() is called.
        fieldSep  string   : field separator. default null (no separating).
        fieldNum  number   : required minimum number of the fields. default null
        filter    function : line filter, return true to pass the filter.
        comment   string   : comment mark. if there's a comment mark in the first chars, filter it. default null.
        empty     boolean  : allow empty line. default true.

        other options are passed to fs.createReadStream()

Four events are available.

1. Event: 'data'
   function (data, isEnd) {}
   Emitted when the stream has received a line
   isEnd: boolean. if it is the end of the data or not.

2. Event: 'end'
   function () {}
   Emitted when the upper stream has emitted an 'end' event 
   No lines remain after this event happens.

3. Event: 'error'
   function (e) {}
   Emitted if there was an error receiving data.

4. Event: 'fd'
   function (fd) {}
    Emitted if source stream emits fd event

var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

/**
 * LineStream: constructor
 * 
 * @implements ReadableStream
 * 
 * @param arg string : file path
 *        arg Stream : stream
 *
 * @param op object 
 *         separator string   : line separator. default: '\n'
 *         trim      boolean  : if true, not add a line separator to the end of line
 *
 *         other options are passed to fs.createReadStream()
 *
 *
 * Four events are available.
 *
 * 1. Event: 'data'
 *    function (data) {}
 *    Emitted when the stream has received a line
 *
 * 2. Event: 'end'
 *    function () {}
 *    Emitted when the upper stream has emitted an 'end' event 
 *    No lines remain after this event happens.
 *
 * 3. Event: 'error'
 *    function (e) {}
 *    Emitted if there was an error receiving data.
 *
 * 4. Event: 'fd'
 *    function (e) {}
 *    Emitted if source stream emits fd event
 *
 */
function LineStream(arg, op) {
  op = op || {};
  this.separator = op.separator || '\n';
  this.lineend = op.trim ? '' : this.separator;
  this.remnant = '';
  this.readable = true; // implementing ReadableStream

  if (typeof arg == 'string') {
    this.stream = fs.createReadStream(arg, op);
  }
  else {
    this.stream = arg;
  }

  var self = this;

  function emitline(data) {
    self.emit('line', data); // deprecated
    self.emit('data', data); // implementing ReadableStream
  }

  this.stream.on('data', function(data) {
    var chunk = self.remnant + data;
    var lines = chunk.split(self.separator);
    self.remnant = lines.pop();
    lines.forEach(function(line) {
      emitline(line + self.lineend);
    });
  });

  this.stream.on('fd', function(fd) {
    self.emit('fd', fd);  // implementing ReadableStream
  });

  this.stream.on('end', function() {
    emitline(self.remnant);
    self.emit('end'); // implementing ReadableStream
    this.readable = false;
  });

  this.stream.on('error', function(e) {
    self.emit('error'); // implementing ReadableStream
  });
}

LineStream.prototype = new EventEmitter();

LineStream.prototype.setEncoding = function(encoding) { // implementing ReadableStream
  // do nothing. because this stream only supports utf-8 text format
}

LineStream.prototype.pause = function() { // implementing ReadableStream
  this.stream.pause();
}

LineStream.prototype.resume = function() { // implementing ReadableStream
  this.stream.resume();
}

LineStream.prototype.destroy = function() { // implementing ReadableStream
  this.stream.destroy();
  this.readable = false;
}

LineStream.prototype.destroySoon = function() { // implementing ReadableStream
  // Not knowing what to do, this remains unimplemented...
  this.destroy();
}

LineStream.prototype.pipe = function() { //MARUNAGE
 return process.stdin.pipe.apply(this, arguments);
} 

LineStream.version = '0.1.0';
module.exports = LineStream;

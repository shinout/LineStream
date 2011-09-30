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
 *    function (fd) {}
 *    Emitted if source stream emits fd event
 *
 */
function LineStream(arg, op) {
  op = op || {};
  this.separator = op.separator || '\n';
  this.lineend = op.trim ? '' : this.separator;
  this.remnant = '';
  this.readable = true; // implementing ReadableStream
  this.paused   = !!op.pause;

  this.emitted = [];

  if (typeof arg == 'string') {
    this.stream = fs.createReadStream(arg, op);
  }
  else {
    this.stream = arg;
  }

  var self = this;

  this.stream.on('data', function(data) {
    var chunk = self.remnant + data;
    var lines = chunk.split(self.separator);
    self.remnant = lines.pop();
    lines.forEach(function(line) {
      emit.call(self, 'data', line + self.lineend);
    });
  });

  this.stream.on('end', function() {
    emit.call(self, 'data', self.remnant);
    emit.call(self, 'end'); // implementing ReadableStream
  });

  this.stream.on('fd', emit.bind(this, 'fd'));
  this.stream.on('error', emit.bind(this, 'error'));
}

function emit() {
  if (arguments.length) this.emitted.push(arguments);
  while (!this.paused && this.emitted.length && this.readable) {
    var emitArgs = this.emitted.shift();
    this.emit.apply(this, emitArgs);
    if (emitArgs[0] == 'end') {
      this.readable = false;
    }
  }
}

LineStream.prototype = new EventEmitter();

LineStream.prototype.resume = function() {
  this.paused = false;
  emit.call(this);
};

LineStream.prototype.pause = function() { // implementing ReadableStream
  this.paused = true;
}

LineStream.prototype.setEncoding = function(encoding) { // implementing ReadableStream
  // do nothing. because this stream only supports utf-8 text format
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

LineStream.version = '0.2.1';
module.exports = LineStream;

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
 *         trim      boolean  : if true, not add a line separator to the end of line. 
 *                              default true.
 *
 *         other options are passed to fs.createReadStream()
 *
 *
 * Four events are available.
 *
 * 1. Event: 'data'
 *    function (data, isEnd) {}
 *    Emitted when the stream has received a line
 *    isEnd: boolean. if it is the end of the data or not.
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
  this.lineend = (op.trim === false) ? this.separator : '';
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
  this.stream.setEncoding("utf8");

  var self = this;

  /**
   * a flag of trimming the end of data or not
   **/
  var remnant_trimmed = false;

  this.stream.on('data', function(data) {
    /**
     * if previous data was trimmed, add the separator
     **/
    if (remnant_trimmed) {
      self.remnant += self.separator;
    }

    // reset trimmed flag
    remnant_trimmed = false;

    /**
     * set trimmed flag if the last character matches separator
     **/
    if (data.charAt(data.length-1) == self.separator) {
      remnant_trimmed = true;
      data = data.slice(0, -1); // trimming
    }

    var chunk = self.remnant + data;

    var lines = chunk.split(self.separator);

    /**
     * set the last line as a remnant, as this line might be incomplete.
     **/
    self.remnant = lines.pop();

    /**
     * emit complete lines
     **/
    lines.forEach(function(line) {
      emit.call(self, 'data', line + self.lineend, false);
    });
  });

  this.stream.on('end', function() {
    var isLast = !(remnant_trimmed && self.lineend);
    emit.call(self, 'data', self.remnant, isLast);

    if (!isLast) {
      emit.call(self, 'data', self.lineend, true);
    }
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


LineStream.version = '0.2.4';
module.exports = LineStream;

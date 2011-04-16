var EventEmitter = require('events').EventEmitter;
var fs = require('fs');

/**
 * LineStream: constructor
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
 * Three events are available.
 *
 * 1. Event: 'line'
 *    function (line) {}
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
 */
function LineStream(arg, op) {
  op = op || {};
  this.separator = op.separator || '\n';
  this.lineend = op.trim ? '' : this.separator;
  this.remnant = '';

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
      self.emit('line', line + self.lineend);
    });
  });

  this.stream.on('end', function() {
    self.emit('line', self.remnant);
    self.emit('end');
  });

  this.stream.on('error', function(e) {
    self.emit('error');
  });
}

LineStream.prototype = new EventEmitter();
module.exports = LineStream;

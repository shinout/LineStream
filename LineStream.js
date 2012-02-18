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
 *         trim      boolean  : if true, not add a line separator to the end of line. default true.
 *         pause     boolean  : if true, not emitting lines unless resume() is called.
 *         fieldSep  string   : field separator. default null (no separating).
 *         fieldNum  number   : required minimum number of the fields. default null
 *         filter    function : line filter, return true to pass the filter.
 *         comment   string   : comment mark. if there's a comment mark in the first chars, filter it. default null.
 *         empty     boolean  : allow empty line. default true.
 *
 *         other options are passed to fs.createReadStream()
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
 **/
function LineStream(arg, op) {
  op = op || {};
  this.separator = op.separator || '\n';
  this.lineend = (op.trim === false) ? this.separator : '';
  this.remnant = '';
  this.readable = true; // implementing ReadableStream
  this.paused   = !!op.pause;

  /**
   * if it is necessary to filter lines
   **/
  this.filters = [];

  if (typeof op.filter == "function") {
    this.filters.push(op.filter); 
  }

  if (typeof op.comment == "string") {
    this.filters.push(function(line) {
      return line.indexOf(op.comment) < 0;
    });
  }

  if (typeof op.fieldSep == "string" && typeof op.fieldNum == "number") {
    this.filters.push(function(line) {
      return line.split(op.fieldSep).length >= op.fieldNum;
    });
  }

  if (op.empty === false) {
    this.filters.push(function(line) {
      return line.trim().length;
    });
  }

  this.emitLine = this.filters.length ? emitLine: emitLineWithoutFilter;


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
      self.emitLine(line + self.lineend, false);
    });
  });

  this.stream.on('end', function() {
    var isLast = !(remnant_trimmed && self.lineend);
    self.emitLine(self.remnant, isLast);

    if (!isLast) {
      self.emitLine(self.lineend, true);
    }
    emit.call(self, 'end'); // implementing ReadableStream
  });

  this.stream.on('fd', emit.bind(this, 'fd'));
  this.stream.on('error', emit.bind(this, 'error'));
}


/**
 * add emit events to the event queue.
 *
 * (private method)
 **/
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


/**
 * emit data event if the given line is valid.
 *
 * (private method)
 **/
function emitLine(line, isEnd) {
  if (this.filters.every(function(fn) { return fn(line) }))
    emit.call(this, 'data', line, !!isEnd);
}

/**
 * emit data event
 *
 * (private method)
 **/
function emitLineWithoutFilter(line, isEnd) {
  emit.call(this, 'data', line, !!isEnd);
}

/**
 * extends EventEmitter
 **/
LineStream.prototype = new EventEmitter();


/**
 * @see ReadableStream
 **/
LineStream.prototype.resume = function() {
  this.paused = false;
  this.stream.resume();
  emit.call(this);
};


/**
 * @see ReadableStream
 **/
LineStream.prototype.pause = function() {
  this.paused = true;
  this.stream.pause();
}


/**
 * @see ReadableStream
 **/
LineStream.prototype.setEncoding = function(encoding) {
  // do nothing. because this stream only supports utf-8 text format
}


/**
 * @see ReadableStream
 **/
LineStream.prototype.destroy = function() {
  this.stream.destroy();
  this.readable = false;
}


/**
 * @see ReadableStream
 **/
LineStream.prototype.destroySoon = function() {
  // Not knowing what to do, this should not be called currently
  this.destroy();
}


/**
 * @see ReadableStream
 **/
LineStream.prototype.pipe = function(wstream, options) {
  options || (options = {});

  wstream.emit("pipe", this);

  this.on("data", function(d) {
    var bool = wstream.write(d);
  });

  if (options.end !== false) {
    this.on("end", function() {
      wstream.end();
    });
  }
  return wstream;
};


LineStream.prototype.after = function() {
  var streams = Array.prototype.slice.call(arguments);
  if (!streams.length) return this;
  if (this.emitted.length) throw new Error("cannot call after() to already-emitted stream");

  this.pause();

  var self = this;

  var streams = Array.prototype.slice.call(arguments);
  var remains = streams.length;

  streams.forEach(function(rstream) {
    rstream.on("end", function() {
      remains--;
      if (remains == 0) self.resume();
    });
  });
  return this;
};


LineStream.tsv = function() {
  var args = Array.prototype.slice.call(arguments);
  var arg = args.shift();
  var fn  = args.pop();

  if (arg == '-') {
    arg = process.stdin;
    process.stdin.resume();
  }

  var lines = new LineStream(arg, args.length? args[0]: null);

  lines.on("data", function(line, isEnd) {
    if (!line.trim()) return;
    fn(line.split("\t"), line, isEnd);
  });
  return lines;
};

LineStream.version = '0.3.0';
module.exports = LineStream;

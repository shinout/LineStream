var LineStream = require('../LineStream');
var EventEmitter = require("events").EventEmitter;
var fs = require('fs');
var filename = __filename;
if (typeof global != 'undefined') require('./load.test').load(global);


var SampleStream = function() {
  this.n = 1;
  this.limit  = 100;

  this.emptyLine   = [5, 15];
  this.invalidLine = [44, 90];
  this.anotherData = [52, 56];
  this.commentLine = [38, 70];
};

SampleStream.prototype = new EventEmitter();

["setEncoding"].forEach(function(name) {
  SampleStream.prototype[name] = function() {};
});

SampleStream.prototype.getData = function() {
  var n = this.n;
  if (n > this.limit) return;

  if (this.emptyLine.indexOf(n) >= 0) {
    this.emit("data", "  \n");
  }
  else if (this.invalidLine.indexOf(n) >= 0) {
    this.emit("data", ["a", "b"].join("\t") + "\n");
  }
  else if (this.commentLine.indexOf(n) >= 0) {
    this.emit("data", ["#a", "b", "c"].join("\t") + "\n");
  }
  else if (this.anotherData.indexOf(n) >= 0) {
    this.emit("data", ["e", "f", "g"].join("\t") + "\n");
  }
  else {
    this.emit("data", ["a", "b", "c"].join("\t") + "\n");
  }
  this.n++;
};

var rstream = new SampleStream();

var timeoutId = setInterval(function() {
  rstream.getData();
  if (rstream.n > rstream.limit) {
    clearInterval(timeoutId);
    rstream.emit("end");
  }
}, 0);

var lines = new LineStream(rstream, {
  comment: "#",
  fieldSep: "\t",
  fieldNum: 3,
  empty: false,
  filter: function(line) {
    return line.charAt(0) == "a";
  }
});

var n = 0;
lines.on("data", function(line) {
  n++;
  T.equal(line, ["a","b","c"].join("\t"));
});

lines.on("end", function() {
  T.equal(n, 100 - 2 - 2 - 2 - 2);
});

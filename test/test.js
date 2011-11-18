var LineStream = require('../LineStream');
var fs = require('fs');
var filename = __filename;
if (typeof global != 'undefined') require('./load.test').load(global);


/**
 * 1. file to lines
 */
var stream = new LineStream(filename, {bufferSize: 300, trim: false});

var result = '';
var linecount = 0;

stream.on('data', function(line) {
  linecount++;
  result += line;
});

stream.on('end', function() {
  var totalfile = fs.readFileSync(filename).toString();
  T.equal(result, totalfile, 'read');
  T.equal(linecount, totalfile.split(stream.separator).length, 'line count');
});

stream.on('error', function(e) {
  console.log(e);
});



/**
 * 2. Stream to lines
 */
var http = require('http');

var req = http.request({host: 'localhost'}, function(res) {
  var stream = new LineStream(res, {trim : false});
  var count = 0;
  var data = '';

  stream.on('data', function(line) {
    count++;
    data += line;
  });

  stream.on('end', function() {
    T.equal(count, data.split(stream.separator).length, 'line count');
  });

  stream.on('error', function(e) {
    console.log(e);
  });
});
req.on("error", function(e) {
  console.ered(e.stack)
});

req.end();

req.on('error', function(e) {
  console.log(e);
});


/**
 * 3. pipe
 */

var rstream = new LineStream(filename, {bufferSize: 300, trim: false});
var wfilename = __dirname + '/cp' + Math.random().toString().replace('.','') + '.js';
var wstream = fs.createWriteStream(wfilename);
rstream.pipe(wstream);

wstream.on('close', function() {
  var thisfile  = fs.readFileSync(filename).toString();
  var cpfile = fs.readFileSync(wfilename).toString();
  console.log(thisfile.length, cpfile.length);
  T.equal(thisfile, cpfile, 'read');

  var exec = require('child_process').exec;
  exec('rm ' + wfilename, function(err, stdout, stderr) {
    if (!err) {
      console.green("a created test file was deleted correctly.");
    }
    else {
      console.ered(err);
    }
  });
});

/**
 * 4. pause -> resume
 */
var stream1 = new LineStream(filename, {bufferSize: 300, pause: true, trim: false});

var result1 = '';
var linecount1 = 0;

stream1.on('data', function(line) {
  linecount1++;
  result1 += line;
});

stream1.on('end', function() {
  var totalfile = fs.readFileSync(filename).toString();
  T.equal(result1, totalfile, 'read (resume)');
  T.equal(linecount1, totalfile.split(stream.separator).length, 'line count(resume)');
});

stream1.on('error', function(e) {
  console.log(e);
});

setTimeout(function() {
  stream1.resume();
}, 1000);

var LineStream = require('../LineStream');
var test = require('./shinout.test');
var fs = require('fs');
var filename = __filename;


/**
 * 1. file to lines
 */
var stream = new LineStream(filename, {bufferSize: 300});

var result = '';
var linecount = 0;

stream.on('data', function(line) {
  linecount++;
  result += line;
});

stream.on('end', function() {
  var totalfile = fs.readFileSync(filename).toString();
  test('equal', result, totalfile, 'incorrect read');
  test('equal', linecount, totalfile.split(stream.separator).length, 'incorrect line count');
  test('result', 'basic use test');
});

stream.on('error', function(e) {
  console.log(e);
});



/**
 * 2. Stream to lines
 */
var https = require('https');

var req = https.request({host: 'github.com'}, function(res) {
  var stream = new LineStream(res);
  var count = 0;
  var data = '';

  stream.on('data', function(line) {
    count++;
    data += line;
  });

  stream.on('end', function() {
    test('equal', count, data.split(stream.separator).length, 'incorrect line count');
    test('result', 'stream to line test');
  });

  stream.on('error', function(e) {
    console.log(e);
  });
});

req.end();

req.on('error', function(e) {
  console.log(e);
});


/**
 * 3. pipe
 */

var rstream = new LineStream(filename, {bufferSize: 300});
var wfilename = __dirname + '/cp' + Math.random().toString().replace('.','') + '.js';
var wstream = fs.createWriteStream(wfilename);
rstream.pipe(wstream);

rstream.on('end', function() {
  var thisfile  = fs.readFileSync(filename).toString();
  var cpfile = fs.readFileSync(wfilename).toString();
  test('equal', thisfile, cpfile, 'incorrect read');
  test('result', 'pipe test');
  var exec = require('child_process').exec;
  exec('rm ' + wfilename, function(err, stdout, stderr) {
    if (!err) {
      console.log("/* a created test file was deleted correctly. */");
    }
    else {
      console.log(err);
    }
  });
});

/**
 * 4. norun -> resume
 */
var stream1 = new LineStream(filename, {bufferSize: 300, norun: true});

var result1 = '';
var linecount1 = 0;

stream1.on('data', function(line) {
  linecount1++;
  result1 += line;
});

stream1.on('end', function() {
  var totalfile = fs.readFileSync(filename).toString();
  test('equal', result1, totalfile, 'incorrect read');
  test('equal', linecount1, totalfile.split(stream.separator).length, 'incorrect line count');
  test('result', 'resume test');
});

stream1.on('error', function(e) {
  console.log(e);
});

stream1.resume();

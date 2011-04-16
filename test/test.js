var LineStream = require('../LineStream');
var test = require('./shinout.test');


/**
 * 1. file to lines
 */
var fs = require('fs');
var filename = __filename;
var stream = new LineStream(filename, {bufferSize: 300});

var result = '';
var linecount = 0;

stream.on('line', function(line) {
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

  stream.on('line', function(line) {
    count++;
    data += line;
  });

  stream.on('end', function() {
    test('equal', count, data.split(stream.separator).length, 'incorrect line count');
    test('result', 'stream pipe test');
  });

  stream.on('error', function(e) {
    console.log(e);
  });
});

req.end();

req.on('error', function(e) {
  console.log(e);
});

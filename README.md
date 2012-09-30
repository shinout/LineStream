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
    });

    stream.on('end', function() { // emitted at the end of file
      console.log('end');
    });

    stream.on('error', function(e) { // emitted when an error occurred
      console.error(e);
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

LineStream extends ReadableStream.

See [Node.js#Stream](http://nodejs.org/docs/latest/api/streams.html#readable_Stream) for ReadableStream's API.


- LineStream.create(source, options)
- on "data"
- LineStream.tsv(source, [options], fn)
- stream.after(rstream1, rstream2, ...)

### LineStream.create(source, options) ###

Creates an instance of LineStream.

**source** is the one of the followings.

- (string) filename. Then reads the file and emit each lines.
- "-". Then resumes **process.stdin** and reads from it.
- (ReadableStream) stream. Then reads lines from the stream.

(Object) **options** is optional.

<table>
<tr><th>key</th>
<td>type</td>
<td>description</td>
<td>example</td></tr>

<tr><th>separator</th>
<td>string</td>
<td>line separator. "\n" by default.<br>
</td>
<td>"\r"</td></tr>

<tr><th>trim</th>
<td>boolean</td>
<td>If true, separator are not appended in the line. <strong>true by default</strong>.<br>
</td>
<td>false</td></tr>


<tr><th>filter</th>
<td>function</td>
<td>filter function before emitting lines.<br>
each line is passed to the function as the first argument.
</td>
<td>function (line) { return line.length }</td></tr>

<tr><th>comment</th>
<td>string</td>
<td>Registers the marks of one-line comment.
If the mark comes in the first position of a line, the line is filtered.
</td>
<td>"#"</td></tr>

<tr><th>fieldSep</th>
<td>string</td>
<td>A field separator. It is used with <strong>fieldNum</strong> options.
</td>
<td>"\t"</td></tr>

<tr><th>fieldNum</th>
<td>string</td>
<td>the required number of the fields.<br>
If not matched, the line is filtered.  </td>
<td>6</td></tr>

<tr><th>empty</th>
<td>boolean</td>
<td>If true, empty lines (after trimmed) are filtered.
</td>
<td>true</td></tr>

</table>

Other options are passed to **fs.createReadStream(filename, options)** if the first argument is a string.

See [fs.createReadStream()](http://nodejs.org/docs/latest/api/fs.html#fs.createReadStream)

### on "data" ###

Data event of LineStream. Two arguments are passed.

- **line**  (string)  each line
- **isEnd** (boolean) whether the line is final or not.

example

    stream.on("data", function(line, isEnd) {
      console.log([line, isEnd].join('\t'));
    });


### LineStream.tsv(source, [options], fn) ###

Creates an instance of LineStream, with field separated by "\t".

**source** and **options** are the same as **LineStream.create(source, options)**.

**fn** is called on "data" event. Three arguments are passed.

- **data** (Array)
- **line** (string)
- **isEnd** (boolean)

data is equivalent to line.split("\t")

Other arguments are the same as original "data" event.

Returns an instance of LineStream.


### stream.after(rstream1, rstream2, ...) ###
Pauses the stream until all passed readable streams come to an end.

    var ids = {};
    var comingLines = LineStream.tsv('-', function(data, line, isEnd) { // reads from process.stdin
      var id = data[0];
      ids[id] = true;
    });

    LineStream.tsv('file1', function(data, line, isEnd) { // reads from "file1"
      var id = data[0];
      if (ids[id]) console.log(line);
    })
    .after(comingLines); // resumes after comingLines finished,

LineStream.js ${version}
==========
[Node.js] ${description}

${changelog}

----------------
<< for (var i in changeLogs) { >>
* [${i}]: ${changeLogs[i]}
<< } >>

${overview}
----------------
### ${what} ###
    ${description2}
    
    var stream = new LineStream(__filename);
    stream.on('data', function(line){
      console.log(line);
    });


### ${install} ###
    git clone git://github.com/shinout/LineStream.git

    ${_OR}

    npm install linestream

### ${usage} ###
#### ${withfile} ####
    var LineStream = require('/path/to/LineStream');
    var stream = new LineStream(filename, {bufferSize: 300});

    stream.on('data', function(line) {
      console.log(line); // ${eachline}
    });

    stream.on('end', function() { // ${endemit(file)}
      console.log('end');
    });

    stream.on('error', function(e) { // ${erremit}
      console.log(e);
    });



#### ${withStream} (${like('HttpResponse')}) ####
    var https = require('https');
    var req = https.request({host: 'github.com'}, function(response) {
      var stream = new LineStream(response);

      stream.on('data', function(line) {
        console.log(line); // ${eachline}
      });

      stream.on('end', function() { // ${endemit('response')}
        console.log('end'); 
      });

      stream.on('error', function(e) { // ${erremit}
        console.log(e);
      });
    });
    req.end();

#### ${pipe}  ####
    var stream = new LineStream(__filename);
    stream.pipe(process.stderr);

### ${notice} ###
* ${separator_notice}
    var stream = new LineStream(filename, {separator: '\r'});   //CR
    var stream = new LineStream(filename, {separator: '\r\n'}); // CRLF

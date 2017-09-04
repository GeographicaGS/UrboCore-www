var sting = require('sting-builder'),
  deps = require('./deps.js').deps;

var debug = (process.argv.length == 3 && process.argv[2]=='debug') ? true : false;

sting.make({
  'debug' : debug,
  'deps' : deps,
  'outputPath' : './public',
  // Languages
  //'langs' : null,
  'outSourceMap' :  debug ? 'main.min.map' : null,
  'compressHTML' : false
});


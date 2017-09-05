var sting = require('sting-builder'),
  deps = require('./deps.js').deps;

const { join } = require('path');
const { lstatSync, readdirSync, existsSync } = require('fs');

var debug = (process.argv.length == 3 && process.argv[2]=='debug') ? true : false;

// Check extra verticals
console.log('\nChecking extra verticals...');

const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
  readdirSync(source).map(name => join(source, name)).filter(isDirectory)
const processDepsFile = (verticalDeps) => {
  deps.templateFolder = deps.templateFolder.concat(verticalDeps.templateFolder);
  console.log(deps.templateFolder);
  deps.JS = deps.JS.concat(verticalDeps.JS);
};

const verticalsBasePath = './src/verticals/';
const verticalFolders = getDirectories(verticalsBasePath);
let totalVerticals = 0;
console.log(`  Found ${verticalFolders.length} possible extra verticals:`);
verticalFolders.forEach((dir) => {
  console.log(`    - ${dir}`);
  // Check deps file and process it
  const depsPath = './' + dir + '/deps.js';
  console.log(depsPath);
  try {
    if (existsSync(depsPath)) {
      const verticalDeps = require(depsPath).deps;
      processDepsFile(verticalDeps);
      totalVerticals++;
    } else {
      throw 'No deps file found';
    }
  } catch (e) {
    console.error(`Error while adding vertical ${dir}: ${e}`);
  }
});
console.log(`Added ${totalVerticals} verticals.\n`);

sting.make({
  'debug' : debug,
  'deps' : deps,
  'outputPath' : './public',
  'outSourceMap' :  debug ? 'main.min.map' : null,
  'compressHTML' : false
});

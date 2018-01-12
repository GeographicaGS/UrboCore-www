// Copyright 2017 Telefónica Digital España S.L.
//
// This file is part of UrboCore WWW.
//
// UrboCore WWW is free software: you can redistribute it and/or
// modify it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// UrboCore WWW is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with UrboCore WWW. If not, see http://www.gnu.org/licenses/.
//
// For those usages not covered by this license please contact with
// iot_support at tid dot es

var sting = require('sting-builder'),
  deps = require('./deps.js').deps,
  resolve = require('path').resolve;

const { join } = require('path');
const { lstatSync, readdirSync, existsSync } = require('fs');

var debug = (process.argv.length == 3 && process.argv[2]=='debug') ? true : false;
var extraResources = deps.extraResources || [];
// Check extra verticals
console.log('\nChecking extra verticals...');

const isDirectory = source => lstatSync(source).isDirectory() || lstatSync(source).isSymbolicLink();
const getDirectories = source =>
  readdirSync(source).map(name => join(source, name)).filter(isDirectory);
const processDepsFile = (verticalDeps) => {
  deps.templateFolder = deps.templateFolder.concat(verticalDeps.templateFolder);
  deps.JS = deps.JS.concat(verticalDeps.JS);
  deps.lessFile = deps.lessFile.concat(verticalDeps.lessFile);
  extraResources = extraResources.concat(verticalDeps.extraResources);
};

const verticalsBasePath = './src/verticals/';
const verticalFolders = getDirectories(verticalsBasePath);
let totalVerticals = 0;
console.log(`  Found ${verticalFolders.length} possible extra verticals:`);
verticalFolders.forEach((dir) => {
  console.log(`    - ${dir}`);
  // Check deps file and process it
  const depsPath = './' + dir + '/deps.js';
  try {
    const absPath = resolve(depsPath);
    if (lstatSync(absPath)) {
      const verticalDeps = require(absPath).deps;
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
  'compressHTML' : false,
  'extraResources': extraResources
});

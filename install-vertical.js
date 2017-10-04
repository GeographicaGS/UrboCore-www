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

const { lstatSync } = require('fs');
const { join } = require('path');
const fs = require('fs-extra');

if (process.argv.length < 4) {
  console.error('No arguments were passed');
  console.info(`USAGE: npm run-script install-vertical <vertical-source-path> <vertical-name>`);
  process.exit();
}

const verticalPath = './src/verticals/';
const srcPath = process.argv[2];
const verticalName = process.argv[3];
const destPath = verticalPath + verticalName;

console.info(`Installing ${verticalName}...`);

try {
  if (lstatSync(destPath).isDirectory()) {
    console.error(`Vertical ${verticalName} is already installed (or needs another name)`);
    process.exit();
  }
} catch (ex) {
  // pass
}

try {
  if (!lstatSync(srcPath).isDirectory() || !lstatSync(join(srcPath, 'www')).isDirectory()) {
    throw `${srcPath} is not a valid vertical`;
  }
} catch (ex) {
  console.error('The source path does not exist');
  console.info(`USAGE: npm run-script install-vertical <vertical-source-path> <vertical-name>`);
  process.exit();
}

fs.copy(join(srcPath, 'www'), verticalPath + verticalName, function (err) {
  if (err) return console.error(err);
  console.info(`${verticalName} installed successfully`);
});

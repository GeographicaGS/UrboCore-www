const { lstatSync } = require('fs');
const { join } = require('path');
const fs = require('fs-extra');

if (process.argv.length < 4) {
  console.error('No arguments were passed');
  console.info(`USAGE: npm run-script update-vertical <vertical-source-path> <vertical-name>`);
  process.exit();
}

const verticalPath = './src/verticals/';
const srcPath = process.argv[2];
const verticalName = process.argv[3];
const destPath = verticalPath + verticalName;

console.info(`Updating ${verticalName}...`);

try {
  if (lstatSync(destPath).isDirectory()) {
    fs.removeSync(destPath);
  }
} catch (ex) {
  console.error(`Vertical ${verticalName} is not installed`);
  process.exit();
}

try {
  if (!lstatSync(srcPath).isDirectory() || !lstatSync(join(srcPath, 'www')).isDirectory()) {
    throw `${srcPath} is not a valid vertical`;
  }
} catch (ex) {
  console.error('The source path does not exist');
  console.info(`USAGE: npm run-script update-vertical <vertical-source-path> <vertical-name>`);
  process.exit();
}

fs.copy(join(srcPath, 'www'), verticalPath + verticalName, function (err) {
  if (err) return console.error(err);
  console.info(`${verticalName} updated successfully`);
});

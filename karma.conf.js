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

// Karma configuration
// Generated on Thu Jan 19 2017 17:09:12 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
      'http://libs.cartocdn.com/cartodb.js/v3/3.15/cartodb.js',
      'src/js/lib/masonry.js',
      'src/js/lib/md5.js',
      'src/js/lib/moment.js',
      'src/js/lib/L.Map.Sync.js',
      'node_modules/karma-read-json/karma-read-json.js',
      'public/js/jquery-2.1.3.min.js',
      'public/js/jquery-ui.min.js',
      'public/js/underscore-1.8.3.min.js',
      'public/js/backbone-min.js',
      'public/js/jed.min.js',
      'public/js/d3.min.js',
      'public/js/nv.d3.min.js',
      'src/js/Namespace.js',
      'src/js/Utils.js',
      'src/js/Metadata.js',
      'src/js/Config.js',
      'src/js/Auth.js',
      'src/js/Router.js',
      'src/js/App.js',
      'src/js/Collection/Metadata/Variable.js',
      'src/js/Collection/Metadata/Entity.js',
      'src/js/Collection/Metadata/Category.js',
      'src/js/Collection/Metadata/Scope.js',
      'test/*.js',
      // serving JSON files
      {pattern: 'public/locale/*.json', included: false}
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['Chrome'],
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}

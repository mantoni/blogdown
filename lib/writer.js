/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var listen = require('listen');
var fs     = require('fs');


exports.write = function (files, callback) {
  var listener = listen();
  files.forEach(function (file) {
    fs.writeFile(file.fileName + '.html', file.html, listener());
  });
  listener.then(callback);
};


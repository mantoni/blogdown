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


exports.write = function (files, target, callback) {
  var listener = listen();
  files.forEach(function (file) {
    var htmlFile = target + '/' + file.fileName + '.html';
    fs.writeFile(htmlFile, file.html, listener());
  });
  listener.then(callback);
};


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


function writeFile(target, file, callback) {
  var htmlFile = target + '/' + file.path + '.html';
  fs.writeFile(htmlFile, file.html, callback);
}


exports.write = function (files, target, callback) {
  var listener = listen();
  files.forEach(function (file) {
    var callback = listener();
    var p        = file.path.indexOf('/');
    if (p !== -1) {
      fs.mkdir(target + '/' + file.path.substring(0, p), function (err) {
        if (err) {
          callback(err);
        } else {
          writeFile(target, file, callback);
        }
      });
    } else {
      writeFile(target, file, callback);
    }
  });
  listener.then(callback);
};


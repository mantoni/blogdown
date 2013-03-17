/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var fs     = require('fs');
var listen = require('listen');


function writeFile(target, file, callback) {
  var htmlFile = target + '/' + file.path;
  fs.writeFile(htmlFile, file.data, callback);
}


exports.write = function (files, target, callback) {
  var listener = listen();
  files.forEach(function (file) {
    var callback = listener();
    var p        = file.path.indexOf('/');
    if (p !== -1) {
      var folder = target + '/' + file.path.substring(0, p);
      fs.exists(folder, function (exists) {
        if (exists) {
          writeFile(target, file, callback);
        } else {
          fs.mkdir(folder, function (err) {
            if (err) {
              callback(err);
            } else {
              writeFile(target, file, callback);
            }
          });
        }
      });
    } else {
      writeFile(target, file, callback);
    }
  });
  listener.then(callback);
};

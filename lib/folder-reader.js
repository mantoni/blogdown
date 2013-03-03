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

var types = {
  json : true,
  html : true,
  md   : true
};

function filter(files) {
  var results = [];
  files.forEach(function (file) {
    var p = file.lastIndexOf('.');
    if (p !== -1 && types[file.substring(p + 1)]) {
      var name = file.substring(0, p);
      if (results.indexOf(name) === -1) {
        results.push(name);
      }
    }
  });
  return results;
}

exports.readFiles = function (path, callback) {

  fs.readdir(path, function (err, files) {
    if (err) {
      callback(err);
    } else {
      callback(null, filter(files));
    }
  });

};

exports.readFolders = function (path, callback) {

  fs.readdir(path, function (err, files) {
    if (err) {
      callback(err);
    } else {
      var listener = listen();
      files.forEach(function (file) {
        var cb = listener();
        fs.stat(file, function (err, stat) {
          if (err) {
            cb(err);
          } else if (stat.isDirectory()) {
            cb(null, file);
          } else {
            cb();
          }
        });
      });
      listener.then(callback);
    }
  });

};

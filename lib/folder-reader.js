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
  json     : true,
  html     : true,
  mustache : true,
  md       : true
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


function handleError(err, verb, path, callback) {
  err.message = 'Cannot ' + verb + ' "' + path + '": ' + err.message;
  callback(err);
}


exports.readFiles = function (path, callback) {

  fs.readdir(path, function (err, files) {
    if (err) {
      handleError(err, 'read dir', path, callback);
    } else {
      callback(null, filter(files));
    }
  });

};

exports.readFolders = function (path, callback) {

  fs.readdir(path, function (err, files) {
    if (err) {
      handleError(err, 'read dir', path, callback);
    } else {
      var listener = listen();
      files.forEach(function (file) {
        var cb       = listener();
        var filePath = path + '/' + file;
        fs.stat(filePath, function (err, stat) {
          if (err) {
            handleError(err, 'stat', filePath, cb);
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

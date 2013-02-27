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

exports.read = function (path, callback) {

  fs.readdir(path, function (err, files) {
    if (err) {
      callback(err);
    } else {
      callback(null, filter(files));
    }
  });

};

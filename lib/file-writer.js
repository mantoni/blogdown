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


function mkdirp(path) {
  if (!fs.existsSync(path)) {
    var p = path.lastIndexOf('/');
    if (p !== -1) {
      mkdirp(path.substring(0, p));
    }
    fs.mkdirSync(path);
  }
}


exports.write = function (files, target, callback) {
  try {
    mkdirp(target);
  } catch (err) {
    callback(err);
    return;
  }
  var listener = listen();
  files.forEach(function (file) {
    var writeFileCallback = listener();
    var p = file.path.lastIndexOf('/');
    if (p !== -1) {
      try {
        mkdirp(target + '/' + file.path.substring(0, p));
      } catch (e) {
        writeFileCallback(e);
        return;
      }
    }
    process.stdout.write('.');
    fs.writeFile(target + '/' + file.path, file.data, writeFileCallback);
  });
  listener.then(function (err) {
    process.stdout.write('\n');
    callback(err);
  });
};

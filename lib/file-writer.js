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

  console.info('Checking %d files in "%s"', files.length, target);
  try {
    mkdirp(target);
  } catch (err) {
    callback(err);
    return;
  }

  var listener = listen();
  files.forEach(function (file) {
    var fileCallback = listener(function (err, unchanged) {
      process.stdout.write(err ? 'F' : (unchanged ? '.' : '+'));
    });
    var fullPath = target + '/' + file.path;
    fs.exists(fullPath, function (exists) {
      if (exists) {
        fs.readFile(fullPath, function (err, data) {
          if (err) {
            fileCallback(err);
          } else if (String(data) !== file.data) {
            fs.writeFile(fullPath, file.data, fileCallback);
          } else {
            fileCallback(null, true);
          }
        });
      } else {
        var p = file.path.lastIndexOf('/');
        if (p !== -1) {
          try {
            mkdirp(target + '/' + file.path.substring(0, p));
          } catch (e) {
            fileCallback(e);
            return;
          }
        }
        fs.writeFile(fullPath, file.data, fileCallback);
      }
    });
  });

  listener.then(function (err) {
    process.stdout.write('\n');
    callback(err);
  });

};

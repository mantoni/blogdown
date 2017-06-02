/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var listen = require('listen');

var folderReader = require('./folder-reader');
var fileReader = require('./file-reader');


exports.read = function (path, context, callback) {

  folderReader.readFiles(path, function (err, names) {
    if (err) {
      callback(err);
    } else {
      var listener = listen();
      names.forEach(function (name) {
        if (name !== 'template') {
          fileReader.read(path + '/' + name, context, listener());
        }
      });
      listener.then(callback);
    }
  });

};

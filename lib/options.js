/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var fileReader = require('../lib/file-reader');

exports.read = function (path, callback) {

  fileReader.read(path, function (err, options) {
    if (err) {
      callback(err);
      return;
    }
    switch (Object.keys(options).length) {
    case 0:
      console.info('No options found in "%s". Using defaults.', path);
      break;
    case 1:
      console.info('Empty options found in "%s". Using defaults.', path);
      break;
    default:
      console.info('Using options from "%s"', path);
    }
    delete options.meta;
    callback(null, options);
  });

};

#!/usr/bin/env node
/**
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
var blogdown   = require('../lib/blogdown');
var fileReader = require('../lib/file-reader');


fileReader.read('options', function (err, options) {
  if (err) {
    process.stderr.write(err.toString());
    process.stderr.write('\n');
    return;
  }
  delete options.meta;
  if (!Object.keys(options).length) {
    console.warn('No options found');
  }

  var time = Date.now();
  blogdown('src', 'site', options, function (err, stats) {
    if (err) {
      if (err.errors) {
        console.error(err.toString());
        err.errors.forEach(function (error) {
          if (error.stack.split('\n').length > 1) {
            console.error(error.stack);
          }
        });
      } else {
        console.error(err.stack);
      }
    } else {
      var line = new Array(70).join('-');
      console.info(line);
      console.info('Processed %d files in %d ms', stats.files,
        Date.now() - time);
      console.info(line);
    }
  });

});

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
  var time = Date.now();
  delete options.fileName;
  if (!Object.keys(options).length) {
    console.error('No options found');
  }

  blogdown('src', 'site', options, function (err) {
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
      console.log('DONE - %s ms', Date.now() - time);
    }
  });

});

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
  delete options.fileName;
  if (!Object.keys(options).length) {
    process.stdout.write('No options found\n');
  }

  blogdown('src', 'site', options, function (err) {
    if (err) {
      process.stderr.write(err.toString());
      process.stderr.write('\n');
    } else {
      process.stdout.write('DONE\n');
    }
  });

});

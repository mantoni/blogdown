#!/usr/bin/env node
/**
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
var options  = require('../lib/options');
var blogdown = require('../lib/blogdown');


options.read('blogdown', function (err, options) {
  if (err) {
    console.error(err);
    return;
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

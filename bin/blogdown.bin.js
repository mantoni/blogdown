#!/usr/bin/env node
/**
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
var log      = require('../lib/log');
var options  = require('../lib/options');
var blogdown = require('../lib/blogdown');
var argv     = require('optimist').argv;


options.read('blogdown', function (err, options) {
  if (err) {
    console.error(err);
    return;
  }

  if (argv.d || argv.debug) {
    log.enableDebug();
  }
  if (argv.publish) {
    if (!options.meta) {
      options.meta = {};
    }
    options.meta.publish = true;
  }

  var time = Date.now();
  blogdown('src', (options.siteDir || 'site'), options, function (err, stats) {
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

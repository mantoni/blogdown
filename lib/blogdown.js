/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var templateReader = require('./template-reader');
var reader         = require('./reader');
var processor      = require('./item-processor');
var renderer       = require('./html-renderer');
var writer         = require('./file-writer');


module.exports = function (source, target, options, callback) {

  reader.read(source, {}, function (err, data) {
    if (err) {
      callback(err);
    } else {
      console.log('--- items ---');
      console.log(data.items);
      console.log('');
      try {
        processor.process(data.items, source, options);
        var files = renderer.render(data.items, data.partials);
        files.forEach(function (file) {
          file.path = file.path.substring(source.length + 1);
        });
        console.log('--- files ---');
        console.log(files);
        console.log('');
        writer.write(files, target, callback);
      } catch (e) {
        callback(e);
      }

    }
  });

};

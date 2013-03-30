/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

require('./log');

var templateReader = require('./template-reader');
var reader         = require('./reader');
var processor      = require('./item-processor');
var renderer       = require('./html-renderer');
var writer         = require('./file-writer');
var itemLinker     = require('../lib/item-linker');


module.exports = function (source, target, options, callback) {
  console.info('Reading from "%s"', source);

  reader.read(source, {}, function (err, data) {
    if (err) {
      callback(err);
    } else {
      console.info('Processing %d items', data.items.length);
      data.items.forEach(function (item) {
        item.file.path = item.file.path.substring(source.length + 1);
      });
      try {
        processor.process(data.items, source, options);
        var files = renderer.render(data.items, data.partials);
        console.info('Writing files to "%s"', target);
        writer.write(files, target, function (err) {
          callback(err, { files : files.length });
        });
      } catch (e) {
        callback(e);
      }

    }
  });

};

/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var reader    = require('./item-reader');
var processor = require('./item-processor');
var renderer  = require('./html-renderer');
var writer    = require('./file-writer');


module.exports = function (source, target, options, callback) {

  reader.read(source, function (err, data) {
    if (err) {
      callback(err);
    } else {
      console.log('');
      console.log('--- partials ---');
      console.log(data.partials);
      console.log('');
      console.log('--- items ---');
      console.log(data.items);
      console.log('');
      try {
        processor.process(data.items, source, options);
        var files = renderer.render(data.items, data.partials);
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

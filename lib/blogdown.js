/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var reader    = require('./reader');
var writer    = require('./writer');
var processor = require('./processor');
var renderer  = require('./renderer');


module.exports = function (source, target, options, callback) {

  reader.read(source, function (err, data) {
    if (err) {
      callback(err);
    } else {

      try {
        processor.process(data.items, options);
        var files = renderer.render(data.items, data.partials);
        writer.write(files, callback);
      } catch (e) {
        callback(e);
      }

    }
  });

};

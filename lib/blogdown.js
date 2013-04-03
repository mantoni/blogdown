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
var list           = require('./list');
var meta           = require('./meta');


module.exports = function (source, target, options, callback) {
  console.info('Reading from "%s"', source);

  var context = { root : source };
  reader.read(source, {}, context, function (err, data) {
    if (err) {
      callback(err);
    } else {
      var items = data.items;
      var metaPath = 'blogdown.meta';
      meta.update(metaPath, items, function (err, metaResult) {
        if (err) {
          callback(err);
        } else {
          try {
            processor.process(items, source, options);
            var lists    = list.createAll(items, options.lists, context);
            var updated  = metaResult.created.concat(metaResult.updated);
            var partials = data.partials;
            var files    = renderer.render(updated, lists, partials, context);
            writer.write(files, target, function (err) {
              if (err) {
                callback(err);
              } else {
                meta.persist(metaPath, metaResult.meta, function (err) {
                  callback(err, { files : files.length });
                });
              }
            });
          } catch (e) {
            callback(e);
          }
        }
      });
    }
  });

};

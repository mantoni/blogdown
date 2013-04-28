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
var list           = require('./list');
var meta           = require('./meta');


module.exports = function (source, target, options, callback) {
  console.info('Reading from "%s"', source);

  var metaOptions    = options.meta || {};
  var context        = { root : source };
  var globalTemplate = { publish : metaOptions.publish || false };
  reader.read(source, globalTemplate, context, function (err, data) {
    if (err) {
      callback(err);
    } else {
      var items = data.items;
      metaOptions.target = target;
      meta.update(items, metaOptions, function (err, metaResult) {
        if (err) {
          callback(err);
        } else {
          try {
            processor.process(items, source, options);
            var lists    = list.createAll(items, options.lists, context);
            var partials = data.partials;
            var files    = renderer.render(items, lists, partials, context);
            writer.write(files, target, function (err) {
              if (err) {
                callback(err);
              } else {
                meta.persist(metaResult.meta, metaOptions, function (err) {
                  callback(err, { files : files.length });
                });
              }
            });
            if (metaResult.deleted.length) {
              console.warn('You may want to delete these files:');
              var deleted = metaResult.deleted.map(function (deleted) {
                return target + '/' + deleted;
              });
              console.warn('  rm ' + deleted.join(' '));
            }
          } catch (e) {
            callback(e);
          }
        }
      });
    }
  });

};

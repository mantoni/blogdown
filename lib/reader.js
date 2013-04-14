/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var listen         = require('listen');

var itemReader     = require('./item-reader');
var folderReader   = require('./folder-reader');
var merger         = require('./merger');
var resolver       = require('./resolver');
var templateReader = require('./template-reader');


exports.read = function (path, parentTemplate, context, callback) {

  var listener               = listen();
  var templateReaderCallback = listener();
  var itemReaderCallback     = listener();

  templateReader.read(path, parentTemplate, templateReaderCallback);

  itemReader.read(path, context, itemReaderCallback);

  listener.then(function (err, results) {
    if (err) {
      callback(err);
    } else {
      var template = results[0];
      var items    = results[1];
      var result   = {};

      if (template.partials) {
        result.partials = template.partials;
      }

      items.forEach(function (item) {
        var file = item.file;
        if (file) {
          var keys = Object.keys(item);
          console.log('%s: Found item "%s" with properties %j', path,
              item.file.name, keys);
        }
      });

      merger.apply(items, template.json);
      items.forEach(function (item) {
        resolver.resolve(item);
      });

      folderReader.readFolders(path, function (err, folders) {
        var readListener = listen();
        folders.forEach(function (folder) {
          if (folder !== 'template') {
            var subPath = path + '/' + folder;
            exports.read(subPath, template, context, readListener());
          }
        });
        readListener.then(function (err, folderResults) {
          if (err) {
            callback(err);
          } else {
            var children = [];
            folderResults.forEach(function (folderResult) {
              children = children.concat(folderResult.items);
            });
            result.items = items.concat(children);
            callback(null, result);
          }
        });
      });
    }
  });

};

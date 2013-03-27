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
var templateReader = require('./template-reader');
var itemLinker     = require('../lib/item-linker');


exports.read = function (path, parentTemplate, callback) {

  var listener               = listen();
  var templateReaderCallback = listener();
  var itemReaderCallback     = listener();

  templateReader.read(path, parentTemplate, templateReaderCallback);

  itemReader.read(path, itemReaderCallback);

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
        var meta = item.meta;
        if (meta) {
          var keys = Object.keys(item);
          console.log('%s: Found item "%s" with properties %j', path,
              item.meta.fileName, keys);
        }
        item.link = {};
      });

      merger.apply(items, template.json);

      itemLinker.previousNext(items);
      itemLinker.sibling(items);

      folderReader.readFolders(path, function (err, folders) {
        var readListener = listen();
        folders.forEach(function (folder) {
          if (folder !== 'template') {
            exports.read(path + '/' + folder, template, readListener());
          }
        });
        readListener.then(function (err, folderResults) {
          if (err) {
            callback(err);
          } else {
            var children = [];
            folderResults.forEach(function (folderResult) {
              itemLinker.parentChild(items, folderResult.items);
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
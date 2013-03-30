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
        var file = item.file;
        if (file) {
          var keys = Object.keys(item);
          console.log('%s: Found item "%s" with properties %j', path,
              item.file.name, keys);
        }
      });

      merger.apply(items, template.json);

      itemLinker.previousNext(items);
      itemLinker.sibling(items);

      folderReader.readFolders(path, function (err, folders) {
        var readListener = listen();
        folders.forEach(function (folder) {
          if (folder !== 'template') {
            exports.read(path + '/' + folder, template,
              readListener(function (err, folderResult) {
                if (folderResult) {
                  folderResult.item = {
                    file      : {
                      path    : path + '/' + folder,
                      dirName : folder
                    }
                  };
                }
              }));
          }
        });
        readListener.then(function (err, folderResults) {
          if (err) {
            callback(err);
          } else {
            var children = [];
            var childrenItems = [];
            folderResults.forEach(function (folderResult) {
              children.push(folderResult.item);
              childrenItems = childrenItems.concat(folderResult.items);
              itemLinker.parentChild([folderResult.item], folderResult.items);
            });
            itemLinker.parentChild(items, children);
            result.items = items.concat(children).concat(childrenItems);
            callback(null, result);
          }
        });
      });
    }
  });

};

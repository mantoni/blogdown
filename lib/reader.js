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
      var result   = { items : results[1] };
      if (template.partials) {
        result.partials = template.partials;
      }

      merger.apply(result.items, template.json);
      result.items.forEach(function (item) {
        if (template.html && !item.html) {
          item.html = template.html;
        }
      });

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
            folderResults.forEach(function (folderResult) {
              result.items = result.items.concat(folderResult.items);
            });
            callback(null, result);
          }
        });
      });
    }
  });

};

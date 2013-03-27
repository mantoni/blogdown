/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var listen     = require('listen');
var fs         = require('fs');

var fileReader = require('./file-reader');
var itemReader = require('./item-reader');
var merger     = require('./merger');


function extractHtml(result, key, item) {
  if (item.html) {
    result[key] = item.html;
    delete item.html;
  }
}


exports.read = function (path, parentTemplate, callback) {
  var listener           = listen();
  var templatePath       = path + '/template';
  var fileReaderCallback = listener();
  var itemReaderCallback = listener();

  fileReader.read(templatePath, fileReaderCallback);

  fs.exists(templatePath, function (exists) {
    if (exists) {
      itemReader.read(templatePath, itemReaderCallback);
    } else {
      itemReaderCallback();
    }
  });

  listener.then(function (err, results) {
    if (err) {
      callback(err);
    } else {
      var template = results[0];
      var items    = results[1];
      var result   = { json : {}, partials : {} };

      if (template) {
        delete template.meta;
        var keys = Object.keys(template);
        if (keys.length) {
          console.log('%s: Found template with properties %j', path, keys);
          merger.apply(result.json, template);
        }
      }
      if (items) {
        items.forEach(function (item) {
          var key = item.meta.fileName;
          delete item.meta;
          console.log('%s: Found template item "%s" with properties %j', path,
            key, Object.keys(item));
          extractHtml(result.partials, key, item);
          if (Object.keys(item).length) {
            result.json[key] = item;
          }
        });
      }

      if (parentTemplate.partials) {
        merger.apply(result.partials, parentTemplate.partials);
      }
      if (parentTemplate.json) {
        merger.apply(result.json, parentTemplate.json);
      }

      callback(null, result);
    }
  });

};

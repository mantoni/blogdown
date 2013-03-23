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

function applyTemplate(result, template) {
  delete template.meta;
  extractHtml(result, 'html', template);
  merger.apply(result.json, template);
}


function applyItems(result, items) {
  items.forEach(function (item) {
    var key = item.meta.fileName;
    delete item.meta;
    extractHtml(result.partials, key, item);
    if (Object.keys(item).length) {
      result.json[key] = item;
    }
  });
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
        applyTemplate(result, template);
      }
      if (items) {
        applyItems(result, items);
      }

      if (parentTemplate.partials) {
        merger.apply(result.partials, parentTemplate.partials);
      }
      if (parentTemplate.json) {
        merger.apply(result.json, parentTemplate.json);
      }

      console.log('--- template %s ---', templatePath);
      console.log(result);
      console.log();

      callback(null, result);
    }
  });

};

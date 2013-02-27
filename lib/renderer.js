/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var mustache = require('mustache');


exports.render = function (items, partials) {

  var files = [];
  items.forEach(function (item) {
    var fileName = item.fileName;
    var template = partials[fileName];
    if (template) {
      var html = mustache.to_html(template, item, partials);
      files.push({
        fileName : fileName,
        html     : html
      });
    } else {
      console.warn('No html for "%s"', fileName);
    }
  });
  return files;

};

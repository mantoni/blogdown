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
    var path     = item.meta.path;
    var template = partials[path.replace(/\//g, '.')];
    if (template) {
      var html = mustache.to_html(template, item, partials);
      files.push({
        path : path,
        html : html
      });
    } else {
      console.warn('No html for "%s"', path);
    }
  });
  return files;

};

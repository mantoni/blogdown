/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var mustache = require('mustache');
var merger = require('./merger');


exports.render = function (items, lists, partials, context) {

  var files = [];
  items.forEach(function (item) {
    var path     = item.file.path;
    var template = item.html;
    if (template) {
      merger.apply(item, lists);
      if (context) {
        context.current = item;
        context.rendering = true;
      }
      var html = mustache.render(template, item, partials);
      files.push({
        path : path,
        data : html
      });
      if (context) {
        context.rendering = false;
        context.current = null;
      }
    } else if (item.file.name) {
      console.warn('No html for "%s"', path);
      console.dir(item);
    }
  });
  return files;

};

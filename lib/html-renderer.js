/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var mustache = require('mustache');


exports.render = function (items, lists, partials) {

  var files = [];
  items.forEach(function (item) {
    var path     = item.file.path;
    var template = item.html;
    if (template) {
      var name;
      for (name in lists) {
        if (lists.hasOwnProperty(name)) {
          var list = lists[name];
          item[name] = list;
          if (list.indexOf(item) !== -1) {
            list.active = item;
          }
        }
      }
      var html = mustache.render(template, item, partials);
      files.push({
        path : path + '.html',
        data : html
      });
      for (name in lists) {
        if (lists.hasOwnProperty(name)) {
          delete lists[name].active;
        }
      }
    } else if (item.file.name) {
      console.warn('No html for "%s"', path);
      console.dir(item);
    }
  });
  return files;

};

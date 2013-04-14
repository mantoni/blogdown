/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';


function resolve(data, path) {
  var key   = path.shift();
  var value = data[key];
  return path.length ? resolve(value, path) : value;
}


function resolveAll(object, data) {
  Object.keys(object).forEach(function (key) {
    if (key !== 'html' && key !== 'md') {
      var value = object[key];
      if (typeof value === 'string') {
        object[key] = value.replace(/\{([a-z\.]+)\}/, function (m, key) {
          return resolve(data, key.split('.'));
        });
      }
      if (typeof value === 'object') {
        resolveAll(value, data);
      }
    }
  });
}


exports.resolve = function (item) {

  resolveAll(item, item);
  if (item.file) {
    item.file.name = item.file.name.toLowerCase().replace(/ /g, '-');
  }

};

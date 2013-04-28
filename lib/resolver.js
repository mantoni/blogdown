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


function replace(value, data, filter) {
  return value.replace(/\{([a-z\.\-]+)\}/g, function (m, key) {
    return filter(resolve(data, key.split('.')));
  });
}


function replaceAll(object, data, filter) {
  Object.keys(object).forEach(function (key) {
    if (key !== 'html' && key !== 'md') {
      var value = object[key];
      if (typeof value === 'string') {
        object[key] = replace(value, data, filter);
      }
      if (typeof value === 'object') {
        replaceAll(value, data, filter);
      }
    }
  });
}


function noopFilter(value) {
  return value;
}


function fileNameFilter(value) {
  return value.toLowerCase().replace(/ /g, '-').replace(/\./g, '');
}


exports.resolve = function (item) {

  if (item.file) {
    item.file.name = replace(item.file.name, item, fileNameFilter);
  }
  replaceAll(item, item, noopFilter);

};

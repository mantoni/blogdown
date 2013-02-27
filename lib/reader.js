/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var listen       = require('listen');
var moment       = require('moment');

var folderReader = require('./folder-reader');
var fileReader   = require('./file-reader');


function process(results) {
  var partials = {};
  var items    = [];

  results.forEach(function (result) {
    if (result.html) {
      partials[result.fileName] = result.html;
      delete result.html;
    }
    if (Object.keys(result).length > 1) {
      items.push(result);
    }
  });

  // prev/next links & timestamp:
  items.forEach(function (item, index) {
    // http://momentjs.com/docs/#/displaying/format/
    item.timestamp = moment().format();
    if (index > 0) {
      item.prev = items[index - 1];
    }
    if (index < items.length - 1) {
      item.next = items[index + 1];
    }
  });

  return {
    partials : partials,
    items    : items
  };
}

exports.read = function (path, callback) {

  folderReader.read(path, function (err, names) {
    if (err) {
      callback(err);
    } else {
      var listener = listen();
      names.forEach(function (name) {
        fileReader.read(path + '/' + name, listener());
      });
      listener.then(function (err, results) {
        if (err) {
          callback(err);
        } else {
          callback(null, process(results));
        }
      });
    }
  });

};

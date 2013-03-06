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


function process(pathLength, results, items, partials) {

  var newItems = [];
  results.forEach(function (result) {
    if (result.html) {
      var key = result.path.substring(pathLength).replace(/\//g, '.');
      partials[key] = result.html;
      delete result.html;
    }
    if (Object.keys(result).length > 2) {
      items.push(result);
      newItems.push(result);
    }
  });

  // prev/next links & timestamp:
  newItems.forEach(function (item, index) {
    item.timestamp = moment().format();
    if (index > 0) {
      item.prev = newItems[index - 1];
    }
    if (index < items.length - 1) {
      item.next = newItems[index + 1];
    }
  });
}

function readFiles(path, callback) {
  folderReader.readFiles(path, function (err, names) {
    if (err) {
      callback(err);
    } else {
      var listener = listen();
      names.forEach(function (name) {
        fileReader.read(path + '/' + name, listener());
      });
      listener.then(callback);
    }
  });
}

exports.read = function (path, callback) {

  var readListener        = listen();
  var readFilesCallback   = readListener();
  var readFoldersCallback = readListener();
  readListener.then(function (err, results) {
    if (err) {
      callback(err);
    } else {
      var partials = {};
      var items    = [];
      var parentItems = results.shift();
      process(path.length + 1, parentItems, items, partials);
      var map = results.shift();
      var key;
      for (key in map) {
        if (map.hasOwnProperty(key)) {
          var subMap   = {};
          var subItems = map[key];
          var i, l = subItems.length;
          for (i = 0; i < l; i++) {
            var subItem = subItems[i];
            subMap[subItem.fileName] = subItem;
          }
          process(path.length + 1, subItems, items, partials);
          var ii, ll = parentItems.length;
          for (ii = 0; ii < ll; ii++) {
            parentItems[ii][key] = subMap;
          }
        }
      }
      callback(null, {
        partials : partials,
        items    : items
      });
    }
  });

  readFiles(path, readFilesCallback);

  folderReader.readFolders(path, function (err, names) {
    if (err) {
      readFoldersCallback(err);
    } else {
      var listener = listen();
      var map = {};
      names.forEach(function (name) {
        var cb = listener();
        readFiles(path + '/' + name, function (err, results) {
          if (err) {
            cb(err);
          } else {
            map[name] = results;
            cb(null);
          }
        });
      });
      listener.then(function (err) {
        if (err) {
          readFoldersCallback(err);
        } else {
          readFoldersCallback(null, map);
        }
      });
    }
  });

};

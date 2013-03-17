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
var itemLinker   = require('./item-linker');


function process(pathLength, results, items, partials) {

  var newItems = [];
  results.forEach(function (result) {
    result.meta.path = result.meta.path.substring(pathLength);
    if (result.html) {
      var key = result.meta.path.replace(/\//g, '.');
      partials[key] = result.html;
      delete result.html;
    }
    if (Object.keys(result).length > 1) {
      items.push(result);
      newItems.push(result);
      result.link = {};
    }
  });

  itemLinker.previousNext(newItems);

  var timestamp = moment().format();
  newItems.forEach(function (item) {
    item.meta.created  = timestamp;
    item.meta.modified = timestamp;
  });

  return newItems;
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
      var parentItems   = results.shift(); // readFilesCallback result
      var childItemsMap = results.shift(); // readFoldersCallback result
      var partials      = {};
      var items         = [];
      var pathLength    = path.length + 1;

      process(pathLength, parentItems, items, partials);

      var key;
      for (key in childItemsMap) {
        if (childItemsMap.hasOwnProperty(key)) {
          var subMap     = {};
          var childItems = childItemsMap[key];
          var newItems   = process(pathLength, childItems, items, partials);
          var i, l = newItems.length;
          for (i = 0; i < l; i++) {
            var childItem = newItems[i];
            subMap[childItem.meta.fileName] = childItem;
          }
          if (Object.keys(subMap).length) {
            var ii, ll = parentItems.length;
            for (ii = 0; ii < ll; ii++) {
              parentItems[ii].link[key] = {
                map  : subMap,
                list : newItems
              };
            }
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

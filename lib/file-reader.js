/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var fs     = require('fs');
var marked = require('marked');
var listen = require('listen');


function readFile(file, processor, defaultValue, callback) {
  fs.exists(file, function (exists) {
    if (exists) {
      fs.readFile(file, function (err, buffer) {
        if (err) {
          err.message = 'Cannot read ' + file + ': ' + err.message;
          callback(err);
        } else {
          callback(null, processor(buffer.toString()));
        }
      });
    } else {
      callback(null, defaultValue);
    }
  });
}


var htmlFiles = ['.html', '.mustache'];


exports.read = function (path, callback) {
  var listener = listen();

  readFile(path + '.json', function (json) {
    return JSON.parse(json);
  }, {}, listener());

  htmlFiles.forEach(function (htmlFile) {
    readFile(path + htmlFile, function (html) {
      return html.trim();
    }, '', listener());
  });

  readFile(path + '.md', function (markdown) {
    return marked(markdown).trim();
  }, null, listener());

  listener.then(function (err, results) {
    if (err) {
      callback(err);
    } else {
      // listen.js returns results in callback creation order:
      var json = results[0];
      var p    = path.lastIndexOf('/');
      json.meta = {
        path     : path,
        fileName : p === -1 ? path : path.substring(p + 1)
      };
      if (results[1]) {
        json.html = results[1];
      }
      if (results[2]) {
        json.html = results[2];
      }
      if (results[3]) {
        json.md = results[3];
      }
      callback(null, json);
    }
  });

};

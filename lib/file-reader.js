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
var path   = require('path');


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


function contextAwareFileProperties(context, filePath, json) {
  var subPath = filePath;
  if (context.root) {
    subPath = filePath.substring(context.root.length + 1);
  } else {
    context.root = '';
  }
  return {
    active: {
      get: function () {
        return context.current === json;
      }
    },
    path: {
      get: function () {
        if (context.current && context.current !== json) {
          var fromDir      = path.dirname(context.current.file.path);
          var toDir        = path.dirname(subPath);
          var relativePath = path.relative(fromDir, toDir);
          var fileName     = path.basename(filePath) + '.html';
          return path.join(relativePath, fileName);
        }
        return subPath + '.html';
      }
    },
    root: {
      get: function () {
        if (context.root) {
          return path.relative(path.dirname(filePath), context.root) || '.';
        }
        return '';
      }
    }
  };
}


var htmlFiles = ['.html', '.mustache'];


exports.read = function (path, context, callback) {

  var listener = listen();

  readFile(path + '.json', function (json) {
    try {
      return JSON.parse(json);
    } catch (e) {
      e.message = 'Failed to parse "' + path + '.json": ' + e.message;
      throw e;
    }
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
      if (results[1]) {
        json.html = results[1];
      }
      if (results[2]) {
        json.html = results[2];
      }
      if (results[3]) {
        json.md = results[3];
      }
      json.file = Object.create({
        name : p === -1 ? path : path.substring(p + 1)
      }, contextAwareFileProperties(context, path, json));
      callback(null, json);
    }
  });

};

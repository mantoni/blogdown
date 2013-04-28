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


function contextAwareFileProperties(context, filePath, suffix, json) {
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
        var fileName = this.name + '.' + suffix;
        var toDir    = path.dirname(subPath);
        if (context.current && context.current !== json) {
          var fromDir      = path.dirname(context.current.file.path);
          var relativePath = path.relative(fromDir, toDir);
          return path.join(relativePath, fileName);
        }
        return path.join(toDir, fileName);
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


exports.read = function (filePath, context, callback) {

  var listener = listen();

  readFile(filePath + '.json', function (json) {
    json = json.replace(/\n\s*/g, ' ');
    try {
      return JSON.parse(json);
    } catch (e) {
      e.message = 'Failed to parse "' + filePath + '.json": ' + e.message;
      throw e;
    }
  }, {}, listener());

  htmlFiles.forEach(function (htmlFile) {
    readFile(filePath + htmlFile, function (html) {
      return html.trim();
    }, '', listener());
  });

  readFile(filePath + '.md', function (markdown) {
    return marked(markdown).trim();
  }, null, listener());

  listener.then(function (err, results) {
    if (err) {
      callback(err);
    } else {
      // listen.js returns results in callback creation order:
      var json = results[0];
      var p    = filePath.lastIndexOf('/');
      if (results[1]) {
        json.html = results[1];
      }
      if (results[2]) {
        json.html = results[2];
      }
      if (results[3]) {
        json.md = results[3];
      }
      if (context) {
        var name;
        var suffix = 'html';
        if (json.file) {
          if (json.file.name) {
            name = json.file.name;
          }
          if (json.file.suffix) {
            suffix = json.file.suffix;
          }
        }
        json.file = Object.create({
          name : path.basename(filePath)
        }, contextAwareFileProperties(context, filePath, suffix, json));
        if (name) {
          // It has to be an own property for the merger to recognize it:
          json.file.name = name;
        }
      }
      callback(null, json);
    }
  });

};

/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var fs = require('fs');
var marked = require('marked');
var listen = require('listen');
var path = require('path');


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
          var fromDir = context.current.file.path;
          if (fromDir.substring(fromDir.length - 1) !== '/') {
            fromDir = path.dirname(fromDir);
          }
          var relativePath = path.relative(fromDir, toDir);
          if (context.rendering && fileName === 'index.html') {
            return relativePath + '/';
          }
          return path.join(relativePath, fileName);
        }
        if (context.rendering && fileName === 'index.html') {
          return toDir + '/';
        }
        return path.join(toDir, fileName);
      }
    },
    suffix: {
      get: function () {
        return suffix;
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


exports.read = function (filePath, context, callback) {

  function parseJSON(json) {
    json = json.replace(/\n\s*/g, ' ');
    try {
      return JSON.parse(json);
    } catch (e) {
      e.message = 'Failed to parse "' + filePath + '.json": ' + e.message;
      throw e;
    }
  }

  function trim(html) {
    return html.trim();
  }

  var listener = listen();

  readFile(filePath + '.json', parseJSON, {}, listener('json'));
  readFile(filePath + '.html', trim, '', listener('html'));
  readFile(filePath + '.mustache', trim, '', listener('mustache'));
  readFile(filePath + '.md', function (markdown) {
    return markdown;
  }, null, listener('md'));

  function extractJson(str, json) {
    // remove jekyll style front-matter markers
    str = str.replace(/^\s*---\n([\s\S]*)---\s*$/m, '$1');
    var match = str.match(/^\}/m);
    if (match && str.match(/^\{/)) {
      var p = match.index + 1;
      var j = parseJSON(str.substring(0, p));
      Object.keys(j).forEach(function (k) {
        json[k] = j[k];
      });
      return str.substring(p).trim();
    }
    return str;
  }

  listener.then(function (err, results) {
    if (err) {
      callback(err);
    } else {
      // listen.js returns results in callback creation order:
      var json = results.json;
      var html = results.html || results.mustache;
      if (html) {
        json.html = extractJson(html, json);
      }
      var markdown = results.md;
      if (markdown) {
        markdown = extractJson(markdown, json);
        json.md  = marked(markdown).trim();
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

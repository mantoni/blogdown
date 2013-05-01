/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var fs     = require('fs');
var crypto = require('crypto');
var moment = require('moment');


function sha(content) {
  var shasum  = crypto.createHash('sha1');
  shasum.update('blob ' + content.length + '\u0000' + content);
  return shasum.digest('hex');
}


function update(items, json, options, callback) {
  var created = [];
  var updated = [];
  var deleted = [];
  var missing = [];
  var found   = {};
  var now     = moment().format();

  items.forEach(function (item) {
    var file    = item.file;
    var path    = file.path;
    var html    = item.html;
    var publish = item.pubish;

    found[path] = true;

    delete item.file;
    delete item.html;
    delete item.publish;

    var contentSha = sha(JSON.stringify(item));
    var htmlSha    = sha(html || '');
    var itemMeta   = json[path];

    if (!itemMeta) {
      var timestamp = options.publish ? now : "DRAFT";
      itemMeta = {
        created  : timestamp,
        modified : timestamp,
        rendered : timestamp
      };
      if (options.publish) {
        json[path] = itemMeta;
      }
      created.push(item);
    } else if (contentSha !== itemMeta.content) {
      itemMeta.modified = now;
      itemMeta.rendered = now;
      updated.push(item);
    } else if (htmlSha !== itemMeta.html) {
      itemMeta.rendered = now;
      updated.push(item);
    } else if (!fs.existsSync(options.target + '/' + path)) {
      missing.push(item);
    }

    itemMeta.content = contentSha;
    itemMeta.html    = htmlSha;

    item.html          = html;
    item.file          = file;
    item.publish       = publish;
    item.file.created  = itemMeta.created;
    item.file.modified = itemMeta.modified;
    item.file.rendered = itemMeta.rendered;
  });

  var path;
  for (path in json) {
    if (json.hasOwnProperty(path) && !found[path]) {
      deleted.push(path);
      delete json[path];
    }
  }

  callback(null, {
    meta    : json,
    created : created,
    updated : updated,
    deleted : deleted,
    missing : missing
  });
}


function metaFile(options) {
  return options.file || 'blogdown.meta';
}


/*
 * {
 *  "file/path": {
 *    "created"  : "...",
 *    "modified" : "...",
 *    "rendered" : "...",
 *    "content"  : "sha",
 *    "html"     : "sha"
 *  }
 * }
 */
exports.update = function (items, options, callback) {
  var file = metaFile(options);
  fs.exists(file, function (exists) {
    if (exists) {
      fs.readFile(file, function (err, buffer) {
        if (err) {
          callback(err);
          return;
        }
        var json = JSON.parse(buffer.toString());
        update(items, json, options, callback);
      });
    } else {
      update(items, {}, options, callback);
    }
  });
};


exports.persist = function (json, options, callback) {
  var file    = metaFile(options);
  var content = JSON.stringify(json, true, '  ');
  fs.writeFile(file, content, callback);
};

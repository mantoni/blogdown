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


function update(items, json, callback) {
  var created = [];
  var updated = [];
  var deleted = [];
  var found   = {};
  var now     = moment().format();

  items.forEach(function (item) {
    var file = item.file;
    var path = file.path;
    var html = item.html;

    found[path] = true;

    delete item.file;
    delete item.html;

    var contentSha = sha(JSON.stringify(item));
    var htmlSha    = sha(html || '');
    var itemMeta   = json[path];

    if (!itemMeta) {
      itemMeta = json[path] = {
        created  : now,
        modified : now,
        rendered : now
      };
      created.push(item);
    } else if (contentSha !== itemMeta.content) {
      itemMeta.modified = now;
      itemMeta.rendered = now;
      updated.push(item);
    } else if (htmlSha !== itemMeta.html) {
      itemMeta.rendered = now;
      updated.push(item);
    }

    itemMeta.content = contentSha;
    itemMeta.html    = htmlSha;

    item.html = html;
    item.file = file;
    item.file.created  = itemMeta.created;
    item.file.modified = itemMeta.modified;
    item.file.rendered = itemMeta.rendered;
  });

  var path;
  for (path in json) {
    if (json.hasOwnProperty(path) && !found[path]) {
      deleted.push(path);
    }
  }

  callback(null, {
    meta    : json,
    created : created,
    updated : updated,
    deleted : deleted
  });
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
exports.update = function (path, items, callback) {
  fs.exists(path, function (exists) {
    if (exists) {
      fs.readFile(path, function (err, buffer) {
        if (err) {
          callback(err);
          return;
        }
        var json = JSON.parse(buffer.toString());
        update(items, json, callback);
      });
    } else {
      update(items, {}, callback);
    }
  });
};


exports.persist = function (path, json, callback) {
  var content = JSON.stringify(json, true, '  ');
  fs.writeFile(path, content, callback);
};

/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var fs     = require('fs');
var moment = require('moment');


exports.process = function (items, path, config) {

  var externalProcessorPath = process.cwd() + '/' + path + '/processor.js';
  var externalProcessor;
  if (fs.existsSync(externalProcessorPath)) {
    externalProcessor = require(externalProcessorPath);
  }

  var now = moment().format();

  items.forEach(function (item) {
    item.meta.created  = now;
    item.meta.modified = now;

    var dateFormats = config.dateFormats;
    if (dateFormats) {
      var key;
      for (key in dateFormats) {
        if (dateFormats.hasOwnProperty(key)) {
          var format = dateFormats[key];
          item[key] = {
            created  : moment(item.meta.created).format(format),
            modified : moment(item.meta.modified).format(format)
          };
        }
      }
    }
  });

  if (externalProcessor) {
    items.forEach(externalProcessor);
  }

};

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
    item.file.created  = now;
    item.file.modified = now;

    var dates = config.dates;
    if (dates) {
      var key, date = {};
      for (key in dates) {
        if (dates.hasOwnProperty(key)) {
          var format = dates[key];
          date[key] = {
            created  : moment(item.file.created).format(format),
            modified : moment(item.file.modified).format(format)
          };
        }
      }
      item.dates = date;
    }
  });

  if (externalProcessor) {
    items.forEach(externalProcessor);
  }

};

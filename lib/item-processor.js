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


exports.process = function (items, source, config) {

  console.info('Processing %d items', items.length);

  var externalProcessorPath = process.cwd() + '/' + source + '/processor.js';
  var externalProcessor;
  if (fs.existsSync(externalProcessorPath)) {
    externalProcessor = require(externalProcessorPath);
  }

  items.forEach(function (item) {
    var dates = config.dates;
    if (dates) {
      var key, date = {};
      if (item.file.created) {
        for (key in dates) {
          if (dates.hasOwnProperty(key)) {
            var format = dates[key];
            date[key] = {
              created  : moment(item.file.created).format(format),
              modified : moment(item.file.modified).format(format),
              rendered : moment(item.file.rendered).format(format)
            };
          }
        }
      }
      item.dates = date;
    }
  });

  if (externalProcessor) {
    items.forEach(externalProcessor);
  }

};

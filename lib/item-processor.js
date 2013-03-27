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

    if (config.dateFormat) {
      item.date = {
        created  : moment(item.meta.created).format(config.dateFormat),
        modified : moment(item.meta.modified).format(config.dateFormat)
      };
    }
  });

  if (externalProcessor) {
    items.forEach(externalProcessor);
  }

};

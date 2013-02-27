/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var moment = require('moment');


exports.process = function (items, config) {

  items.forEach(function (item) {
    if (config.dateFormat) {
      item.date = moment(item.timestamp).format(config.dateFormat);
    }
  });

};


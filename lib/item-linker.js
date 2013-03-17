/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';


exports.previousNext = function (items) {
  items.forEach(function (item, index) {
    item.link.previous = index === 0 ? null : items[index - 1];
    item.link.next = index === items.length - 1 ? null : items[index + 1];
  });
};

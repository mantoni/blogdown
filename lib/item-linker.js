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
    item.previous = index === 0 ? null : items[index - 1];
    item.next = index === items.length - 1 ? null : items[index + 1];
  });

};


function createItemMap(items) {
  var map = Array.prototype.slice.call(items);
  items.forEach(function (item) {
    if (item.file) {
      var key = item.file.name;
      if (key) {
        map[key.replace('.', '_')] = item;
      }
    }
  });
  return map;
}


exports.sibling = function (items) {
  var map = createItemMap(items);
  items.forEach(function (item) {
    item.sibling = map;
  });
};


exports.parentChild = function (items, children) {
  var childMap  = createItemMap(children);
  var parentMap = createItemMap(items);
  items.forEach(function (item) {
    if (!item.child) {
      item.child = childMap;
    }
  });
  children.forEach(function (item) {
    if (!item.parent) {
      item.parent = parentMap;
    }
  });
};

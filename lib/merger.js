/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

exports.apply = function (object, json) {

  if (object.forEach) {
    object.forEach(function (item) {
      exports.apply(item, json);
    });
  } else {
    var key;
    for (key in json) {
      if (json.hasOwnProperty(key) && !object.hasOwnProperty(key)) {
        object[key] = json[key];
      }
    }
  }

};

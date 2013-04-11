/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var RESET  = '\x1B[0m';
var NORMAL = '\x1B[0;';
var BOLD   = '\x1B[1;';

var WHITE  = '37m';
var YELLOW = '33m';
var RED    = '31m';

function wrap(fn, prefix, color) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var msg  = args[0];
    if (typeof msg === 'string') {
      args[0] = color + prefix + msg + RESET;
    }
    fn.apply(console, args);
  };
}

var log    = console.log;
var info   = console.info;
var warn   = console.warn;
var error  = console.error;

console.log   = function () {};
console.info  = wrap(log, '[INFO ] ', BOLD + WHITE);
console.warn  = wrap(log, '[WARN ] ', NORMAL + YELLOW);
console.error = wrap(log, '[ERROR] ', NORMAL + RED);

exports.enableDebug = function () {
  console.log   = wrap(log, '[DEBUG] ', NORMAL + WHITE);
};

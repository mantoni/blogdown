/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var util = require('util');


function createNav(list, context) {
  return Object.create({}, {
    previous: {
      get: function () {
        var index = list.indexOf(context.current);
        return list[index - 1] || null;
      }
    },
    next: {
      get: function () {
        var index = list.indexOf(context.current);
        return (index !== -1 && list[index + 1]) || null;
      }
    }
  });
}


function resolve(object, path) {
  var p = path.indexOf('.'), obj;
  if (p !== -1) {
    var key = path.substring(0, p);
    obj = object[key];
    if (obj === undefined) {
      throw new Error(util.format('Unknown property "%s"', key));
    }
    return resolve(obj, path.substring(p + 1));
  }
  obj = object[path];
  if (obj === undefined) {
    throw new Error(util.format('Unknown property "%s"', path));
  }
  return obj;
}

function sortBy(key) {
  return function (a, b) {
    a = resolve(a, key);
    b = resolve(b, key);
    return a > b ? 1 : (a < b ? -1 : 0);
  };
}

function matchRegExp(value, re) {
  var match = value.match(re);
  if (match) {
    return match;
  }
  throw new SyntaxError('Illegal expression');
}

function equals(expecation) {
  return function (value) {
    return value === expecation;
  };
}

function matches(re) {
  return function (value) {
    return re.test(value);
  };
}

function not(fn) {
  return function (v) {
    return !fn(v);
  };
}

function filter(key, comparator) {
  return function (item) {
    return comparator(String(resolve(item, key)));
  };
}

function rethrow(e, verb, listName, value) {
  e.message = util.format('Cannot %s %s by "%s"; %s',
      verb, listName || 'list', value, e.message);
  throw e;
}

exports.create = function (items, config, context, name) {
  var match;

  if (config.filter) {
    /*jslint regexp: true*/
    try {
      match = matchRegExp(config.filter,
          /^([\w\-\.]+) ?(=|\!=) ?([^\*]+)(\*)?$/);
      var value      = match[3];
      var comparator = match[4]
        ? matches(new RegExp('^' + value))
        : equals(value);
      if (match[2] === '!=') {
        comparator = not(comparator);
      }
      items = items.filter(filter(match[1], comparator));
    } catch (e1) {
      rethrow(e1, 'filter', name, config.filter);
    }
  }

  if (config.sort) {
    try {
      match = matchRegExp(config.sort, /^([\w\-\.]+)(?: (ASC|DESC))?$/);
      items = items.sort(sortBy(match[1]));
    } catch (e2) {
      rethrow(e2, 'sort', name, config.sort);
    }
    if (match[2] === 'DESC') {
      items = items.reverse();
    }
  }

  items = items.slice(0, config.limit || items.length);
  var nav = createNav(items, context);
  Object.defineProperty(items, 'nav', {
    get: function () {
      return nav;
    }
  });

  return items;
};


exports.createAll = function (items, config, context) {
  var map = {};
  var name;
  for (name in config) {
    if (config.hasOwnProperty(name)) {
      var list = exports.create(items, config[name], context, name);
      if (list.length) {
        console.info('List "%s" has %d items', name, list.length);
      } else {
        console.warn('List "%s" is empty', name);
      }
      map[name] = list;
    }
  }
  return map;
};

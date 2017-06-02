/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*eslint-env mocha*/
'use strict';

var assert = require('assert');
var merger = require('../lib/merger');

describe('template-merger', function () {
  var item;
  var items;

  beforeEach(function () {
    item  = { q : 1 };
    items = [item, { q : 2 }];
  });

  it('does nothing to object if json is empty', function () {
    merger.apply(item, {});

    assert.deepEqual(item, { q : 1 });
  });

  it('does nothing to array if json is empty', function () {
    merger.apply(items, {});

    assert.deepEqual(items, [{ q : 1 }, { q : 2 }]);
  });

  it('merges json into each array element', function () {
    merger.apply(items, { a : 42 });

    assert.deepEqual(items[0], { q : 1, a : 42 });
    assert.deepEqual(items[1], { q : 2, a : 42 });
  });

  it('merges json with object', function () {
    merger.apply(item, { a : 42 });

    assert.deepEqual(item, { q : 1, a : 42 });
  });

  it('does not override values', function () {
    merger.apply(item, { q : 42 });

    assert.deepEqual(item, { q : 1 });
  });

  it('does not override array element values', function () {
    merger.apply(items, { q : 42 });

    assert.deepEqual(items, [{ q : 1 }, { q : 2 }]);
  });

  it('recurses deeply into objects', function () {
    var item = { file : {} };

    merger.apply(item, { file : { name : 'foo' } });

    assert.deepEqual(item, { file : { name : 'foo' } });
  });

});


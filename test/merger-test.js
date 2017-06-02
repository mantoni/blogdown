/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test = require('utest');
var assert = require('assert');

var merger = require('../lib/merger');


test('template-merger', {

  before: function () {
    this.item  = { q : 1 };
    this.items = [this.item, { q : 2 }];
  },


  'does nothing to object if json is empty': function () {
    merger.apply(this.item, {});

    assert.deepEqual(this.item, { q : 1 });
  },


  'does nothing to array if json is empty': function () {
    merger.apply(this.items, {});

    assert.deepEqual(this.items, [{ q : 1 }, { q : 2 }]);
  },


  'merges json into each array element': function () {
    merger.apply(this.items, { a : 42 });

    assert.deepEqual(this.items[0], { q : 1, a : 42 });
    assert.deepEqual(this.items[1], { q : 2, a : 42 });
  },


  'merges json with object': function () {
    merger.apply(this.item, { a : 42 });

    assert.deepEqual(this.item, { q : 1, a : 42 });
  },


  'does not override values': function () {
    merger.apply(this.item, { q : 42 });

    assert.deepEqual(this.item, { q : 1 });
  },


  'does not override array element values': function () {
    merger.apply(this.items, { q : 42 });

    assert.deepEqual(this.items, [{ q : 1 }, { q : 2 }]);
  },


  'recurses deeply into objects': function () {
    var item = { file : {} };

    merger.apply(item, { file : { name : 'foo' } });

    assert.deepEqual(item, { file : { name : 'foo' } });
  }

});


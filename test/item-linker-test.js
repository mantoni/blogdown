/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test       = require('utest');
var assert     = require('assert');
var sinon      = require('sinon');

var itemLinker = require('../lib/item-linker');


test('item-linker previousNext', {

  'links two items': function () {
    var first  = { link : {} };
    var second = { link : {} };

    itemLinker.previousNext([first, second]);

    assert.strictEqual(first.link.next, second);
    assert.strictEqual(second.link.next, null);
    assert.strictEqual(second.link.previous, first);
    assert.strictEqual(first.link.previous, null);
  },


  'links three items': function () {
    var first  = { link : {} };
    var second = { link : {} };
    var third  = { link : {} };

    itemLinker.previousNext([first, second, third]);

    assert.strictEqual(first.link.next, second);
    assert.strictEqual(second.link.next, third);
    assert.strictEqual(third.link.next, null);
    assert.strictEqual(third.link.previous, second);
    assert.strictEqual(second.link.previous, first);
    assert.strictEqual(first.link.previous, null);
  }

});

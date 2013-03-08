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
    var first  = {};
    var second = {};

    itemLinker.previousNext([first, second]);

    assert.strictEqual(first.next, second);
    assert.strictEqual(second.next, null);
    assert.strictEqual(second.previous, first);
    assert.strictEqual(first.previous, null);
  },


  'links three items': function () {
    var first  = {};
    var second = {};
    var third  = {};

    itemLinker.previousNext([first, second, third]);

    assert.strictEqual(first.next, second);
    assert.strictEqual(second.next, third);
    assert.strictEqual(third.next, null);
    assert.strictEqual(third.previous, second);
    assert.strictEqual(second.previous, first);
    assert.strictEqual(first.previous, null);
  }

});

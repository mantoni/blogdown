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


function typeOf(object) {
  return Object.prototype.toString.call(object);
}

test('item-linker sibling', {

  'creates sibling array on each item': function () {
    var first  = { meta : { fileName : 'a' } };
    var second = { meta : { fileName : 'b' } };
    var third  = { meta : { fileName : 'c' } };

    itemLinker.sibling([first, second, third]);

    assert.equal(typeOf(first.sibling), '[object Array]');
    assert.equal(typeOf(second.sibling), '[object Array]');
    assert.equal(typeOf(third.sibling), '[object Array]');
  },


  'links sibling with each other by index': function () {
    var first  = { meta : { fileName : 'a' } };
    var second = { meta : { fileName : 'b' } };
    var third  = { meta : { fileName : 'c' } };

    itemLinker.sibling([first, second, third]);

    assert.strictEqual(first.sibling[0], first);
    assert.strictEqual(first.sibling[1], second);
    assert.strictEqual(first.sibling[2], third);
    assert.strictEqual(second.sibling[0], first);
    assert.strictEqual(second.sibling[1], second);
    assert.strictEqual(second.sibling[2], third);
    assert.strictEqual(third.sibling[0], first);
    assert.strictEqual(third.sibling[1], second);
    assert.strictEqual(third.sibling[2], third);
  },


  'links sibling with each other by fileName': function () {
    var first  = { meta : { fileName : 'a' } };
    var second = { meta : { fileName : 'b' } };
    var third  = { meta : { fileName : 'c' } };

    itemLinker.sibling([first, second, third]);

    assert.strictEqual(first.sibling.a, first);
    assert.strictEqual(first.sibling.b, second);
    assert.strictEqual(first.sibling.c, third);
    assert.strictEqual(second.sibling.a, first);
    assert.strictEqual(second.sibling.b, second);
    assert.strictEqual(second.sibling.c, third);
    assert.strictEqual(third.sibling.a, first);
    assert.strictEqual(third.sibling.b, second);
    assert.strictEqual(third.sibling.c, third);
  }

});


test('item-linker parentChild', {

  'creates child and  parent arrays on items': function () {
    var first  = { meta : { fileName : 'a' } };
    var second = { meta : { fileName : 'b' } };
    var third  = { meta : { fileName : 'c' } };
    var fourth = { meta : { fileName : 'd' } };

    itemLinker.parentChild([first, second], [third, fourth]);

    assert.equal(typeOf(first.child), '[object Array]');
    assert.equal(typeOf(second.child), '[object Array]');
    assert.equal(typeOf(third.child), '[object Undefined]');
    assert.equal(typeOf(fourth.child), '[object Undefined]');
    assert.equal(typeOf(first.parent), '[object Undefined]');
    assert.equal(typeOf(second.parent), '[object Undefined]');
    assert.equal(typeOf(third.parent), '[object Array]');
    assert.equal(typeOf(fourth.parent), '[object Array]');
  },


  'links children and parents by index': function () {
    var first  = { meta : { fileName : 'a' } };
    var second = { meta : { fileName : 'b' } };
    var third  = { meta : { fileName : 'c' } };
    var fourth = { meta : { fileName : 'd' } };

    itemLinker.parentChild([first, second], [third, fourth]);

    assert.strictEqual(first.child[0], third);
    assert.strictEqual(first.child[1], fourth);
    assert.strictEqual(second.child[0], third);
    assert.strictEqual(second.child[1], fourth);
    assert.strictEqual(third.parent[0], first);
    assert.strictEqual(third.parent[1], second);
    assert.strictEqual(fourth.parent[0], first);
    assert.strictEqual(fourth.parent[1], second);
  },


  'links children and parents by fileName': function () {
    var first  = { meta : { fileName : 'a' } };
    var second = { meta : { fileName : 'b' } };
    var third  = { meta : { fileName : 'c' } };
    var fourth = { meta : { fileName : 'd' } };

    itemLinker.parentChild([first, second], [third, fourth]);

    assert.strictEqual(first.child.c, third);
    assert.strictEqual(first.child.d, fourth);
    assert.strictEqual(second.child.c, third);
    assert.strictEqual(second.child.d, fourth);
    assert.strictEqual(third.parent.a, first);
    assert.strictEqual(third.parent.b, second);
    assert.strictEqual(fourth.parent.a, first);
    assert.strictEqual(fourth.parent.b, second);
  }

});

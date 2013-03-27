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


function typeOf(object) {
  return Object.prototype.toString.call(object);
}

test('item-linker sibling', {

  'creates sibling array on each item': function () {
    var first  = { link : {}, meta : { fileName : 'a' } };
    var second = { link : {}, meta : { fileName : 'b' } };
    var third  = { link : {}, meta : { fileName : 'c' } };

    itemLinker.sibling([first, second, third]);

    assert.equal(typeOf(first.link.sibling), '[object Array]');
    assert.equal(typeOf(second.link.sibling), '[object Array]');
    assert.equal(typeOf(third.link.sibling), '[object Array]');
  },


  'links sibling with each other by index': function () {
    var first  = { link : {}, meta : { fileName : 'a' } };
    var second = { link : {}, meta : { fileName : 'b' } };
    var third  = { link : {}, meta : { fileName : 'c' } };

    itemLinker.sibling([first, second, third]);

    assert.strictEqual(first.link.sibling[0], first);
    assert.strictEqual(first.link.sibling[1], second);
    assert.strictEqual(first.link.sibling[2], third);
    assert.strictEqual(second.link.sibling[0], first);
    assert.strictEqual(second.link.sibling[1], second);
    assert.strictEqual(second.link.sibling[2], third);
    assert.strictEqual(third.link.sibling[0], first);
    assert.strictEqual(third.link.sibling[1], second);
    assert.strictEqual(third.link.sibling[2], third);
  },


  'links sibling with each other by fileName': function () {
    var first  = { link : {}, meta : { fileName : 'a' } };
    var second = { link : {}, meta : { fileName : 'b' } };
    var third  = { link : {}, meta : { fileName : 'c' } };

    itemLinker.sibling([first, second, third]);

    assert.strictEqual(first.link.sibling.a, first);
    assert.strictEqual(first.link.sibling.b, second);
    assert.strictEqual(first.link.sibling.c, third);
    assert.strictEqual(second.link.sibling.a, first);
    assert.strictEqual(second.link.sibling.b, second);
    assert.strictEqual(second.link.sibling.c, third);
    assert.strictEqual(third.link.sibling.a, first);
    assert.strictEqual(third.link.sibling.b, second);
    assert.strictEqual(third.link.sibling.c, third);
  }

});


test('item-linker parentChild', {

  'creates child and  parent arrays on items': function () {
    var first  = { link : {}, meta : { fileName : 'a' } };
    var second = { link : {}, meta : { fileName : 'b' } };
    var third  = { link : {}, meta : { fileName : 'c' } };
    var fourth = { link : {}, meta : { fileName : 'd' } };

    itemLinker.parentChild([first, second], [third, fourth]);

    assert.equal(typeOf(first.link.child), '[object Array]');
    assert.equal(typeOf(second.link.child), '[object Array]');
    assert.equal(typeOf(third.link.child), '[object Undefined]');
    assert.equal(typeOf(fourth.link.child), '[object Undefined]');
    assert.equal(typeOf(first.link.parent), '[object Undefined]');
    assert.equal(typeOf(second.link.parent), '[object Undefined]');
    assert.equal(typeOf(third.link.parent), '[object Array]');
    assert.equal(typeOf(fourth.link.parent), '[object Array]');
  },


  'links children and parents by index': function () {
    var first  = { link : {}, meta : { fileName : 'a' } };
    var second = { link : {}, meta : { fileName : 'b' } };
    var third  = { link : {}, meta : { fileName : 'c' } };
    var fourth = { link : {}, meta : { fileName : 'd' } };

    itemLinker.parentChild([first, second], [third, fourth]);

    assert.strictEqual(first.link.child[0], third);
    assert.strictEqual(first.link.child[1], fourth);
    assert.strictEqual(second.link.child[0], third);
    assert.strictEqual(second.link.child[1], fourth);
    assert.strictEqual(third.link.parent[0], first);
    assert.strictEqual(third.link.parent[1], second);
    assert.strictEqual(fourth.link.parent[0], first);
    assert.strictEqual(fourth.link.parent[1], second);
  },


  'links children and parents by fileName': function () {
    var first  = { link : {}, meta : { fileName : 'a' } };
    var second = { link : {}, meta : { fileName : 'b' } };
    var third  = { link : {}, meta : { fileName : 'c' } };
    var fourth = { link : {}, meta : { fileName : 'd' } };

    itemLinker.parentChild([first, second], [third, fourth]);

    assert.strictEqual(first.link.child.c, third);
    assert.strictEqual(first.link.child.d, fourth);
    assert.strictEqual(second.link.child.c, third);
    assert.strictEqual(second.link.child.d, fourth);
    assert.strictEqual(third.link.parent.a, first);
    assert.strictEqual(third.link.parent.b, second);
    assert.strictEqual(fourth.link.parent.a, first);
    assert.strictEqual(fourth.link.parent.b, second);
  }

});

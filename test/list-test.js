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
var sinon = require('sinon');
var list = require('../lib/list');

describe('list', function () {

  it('returns the array unmodified', function () {
    var result = list.create([{ foo: 'foo' }, { bar : 'bar' }], {}, {});

    assert.deepEqual(result, [{ foo: 'foo' }, { bar : 'bar' }]);
  });

});


describe('list limit', function () {

  it('shortens the array', function () {
    var result = list.create(new Array(10), { limit : 3 });

    assert.equal(result.length, 3);
  });

});

describe('list sort', function () {

  it('sorts items naturally by property', function () {
    var result = list.create([{ a : 2 }, { a : 1 }], { sort : 'a' });

    assert.deepEqual(result, [{ a : 1 }, { a : 2 }]);
  });

  it('sorts and then shortens items', function () {
    var result = list.create([{ a : 2 }, { a : 1 }], {
      sort  : 'a',
      limit : 1
    });

    assert.deepEqual(result, [{ a : 1 }]);
  });

  it('sorts items DESC by property', function () {
    var result = list.create([{ a : 1 }, { a : 2 }], { sort : 'a DESC' });

    assert.deepEqual(result, [{ a : 2 }, { a : 1 }]);
  });

  it('sorts items ASC by property', function () {
    var result = list.create([{ a : 2 }, { a : 1 }], { sort : 'a ASC' });

    assert.deepEqual(result, [{ a : 1 }, { a : 2 }]);
  });

  it('throws if order direction is not ASC or DESC', function () {
    assert.throws(function () {
      list.create([], { sort : 'a FOO' });
    }, /^SyntaxError\: Cannot sort list by "a FOO"; Illegal expression$/);
  });

  it('resolves property path', function () {
    var result = list.create([{ a : { b : 2 } }, { a : { b : 1 } }],
        { sort : 'a.b ASC' });

    assert.deepEqual(result, [{ a : { b : 1 } }, { a : { b : 2 } }]);
  });

  it('throws meaningful error if property is undefined', function () {
    assert.throws(function () {
      list.create([{ a : 1 }, { a : 2 }], { sort : 'b' });
    }, /^Error\: Cannot sort list by "b"; Unknown property "b"$/);
  });

  it('throws meaningful error if property path is undefined', function () {
    assert.throws(function () {
      list.create([{ a : { b : 1 } }, { a : { c : 2 } }], { sort : 'a.c' });
    }, /^Error\: Cannot sort list by "a\.c"; Unknown property "c"$/);
  });

  it('throws meaningful error if property path cannot be resolved',
    function () {
      assert.throws(function () {
        list.create([{ a : { b : 1 } }, { a : { c : 2 } }], { sort : 'a.b.c' });
      }, /^Error\: Cannot sort list by "a\.b\.c"; Unknown property/);
    });

});

describe('list filter', function () {

  it('filters items by key = value', function () {
    var result = list.create([{ a : 2 }, { a : 1 }], { filter : 'a = 1' });

    assert.deepEqual(result, [{ a : 1 }]);
  });

  it('filters items by key=value', function () {
    var result = list.create([{ a : 2 }, { a : 1 }], { filter : 'a=1' });

    assert.deepEqual(result, [{ a : 1 }]);
  });

  it('filters items by key != value', function () {
    var result = list.create([{ a : 2 }, { a : 1 }], { filter : 'a != 1' });

    assert.deepEqual(result, [{ a : 2 }]);
  });

  it('filters items by key!=value', function () {
    var result = list.create([{ a : 2 }, { a : 1 }], { filter : 'a!=1' });

    assert.deepEqual(result, [{ a : 2 }]);
  });

  it('filters items by key = val*', function () {
    var result = list.create([{ a : 'a1' }, { a : 'a2' }, { a : 'b1' }],
        { filter : 'a = a*' });

    assert.deepEqual(result, [{ a : 'a1' }, { a : 'a2' }]);
  });

  it('throws if filter does not make sense', function () {
    assert.throws(function () {
      list.create([], { filter : 'a # b' });
    }, /^SyntaxError\: Cannot filter list by "a # b"; Illegal expression$/);
  });

  it('resolves property path', function () {
    var result = list.create([{ a : { b : 42 } }], { filter : 'a.b = 42' });

    assert.equal(result.length, 1);
  });

});

describe('list nav', function () {
  var context;
  var l;

  beforeEach(function () {
    context = {};
    l = list.create([{ n : 1 }, { n : 2 }, { n : 3 }], {}, context);
  });

  it('initialized previous and next with null', function () {
    assert.strictEqual(l.nav.previous, null);
    assert.strictEqual(l.nav.next, null);
  });

  it('activates the first item', function () {
    context.current = l[0];

    assert.strictEqual(l.nav.previous, null);
    assert.strictEqual(l.nav.next, l[1]);
  });

  it('activates the second item', function () {
    context.current = l[1];

    assert.strictEqual(l.nav.previous, l[0]);
    assert.strictEqual(l.nav.next, l[2]);
  });

  it('activates the third item', function () {
    context.current = l[2];

    assert.strictEqual(l.nav.previous, l[1]);
    assert.strictEqual(l.nav.next, null);
  });

});

describe('list createAll', function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('creates a map of lists for the given config', function () {
    var result = list.createAll([{ n : 1 }, { n : 2 }], {
      foo : { limit : 1 },
      bar : { sort  : 'n DESC' }
    });

    assert.deepEqual(result, {
      foo : [{ n : 1 }],
      bar : [{ n : 2 }, { n : 1 }]
    });
  });

  it('passes context  and list name to create', function () {
    sandbox.spy(list, 'create');
    var context = { some : 'context' };

    list.createAll([], { foo : { limit : 1 } }, context);

    sinon.assert.calledWith(list.create, sinon.match.any, sinon.match.any,
      context, 'foo');
  });

});

/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test   = require('utest');
var assert = require('assert');

var resolver = require('../lib/resolver');


test('resolver', {

  'resolves placeholder in properties': function () {
    var item = {
      title   : '{heading} - Keep it DRY',
      heading : 'Please'
    };

    resolver.resolve(item);

    assert.equal(item.title, 'Please - Keep it DRY');
    assert.equal(item.heading, 'Please');
  },


  'resolves placeholder in properties recursively': function () {
    var item = {
      deep  : { replace : 'That {other.part}' },
      other : { part    : 'thingy' }
    };

    resolver.resolve(item);

    assert.equal(item.deep.replace, 'That thingy');
  },


  'resolves placeholder in file name': function () {
    var item = {
      file    : { name  : '{resolve}' },
      resolve : 'resolved'
    };

    resolver.resolve(item);

    assert.equal(item.file.name, 'resolved');
  },


  'lower cases and dashes resolved placeholder in file name': function () {
    var item = {
      file    : { name  : '{resolve}' },
      resolve : 'This Is It'
    };

    resolver.resolve(item);

    assert.equal(item.file.name, 'this-is-it');
  },


  'does not change html': function () {
    var item = { html : '<pre>{{example}}</pre>' };

    resolver.resolve(item);

    assert.equal(item.html, '<pre>{{example}}</pre>');
  },


  'does not change md': function () {
    var item = { md : '```{{example}}```' };

    resolver.resolve(item);

    assert.equal(item.md, '```{{example}}```');
  }

});

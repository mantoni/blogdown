/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test     = require('utest');
var assert   = require('assert');
var sinon    = require('sinon');

var renderer = require('../lib/html-renderer');


var testMeta = { path : 'test' };


test('renderer', {

  before: function () {
    sinon.stub(console, 'warn');
  },

  after: function () {
    console.warn.restore();
  },

  'returns empty array': function () {
    var results = renderer.render([], {});

    assert.deepEqual(results, []);
  },


  'returns array with objects of path and html': function () {
    var results = renderer.render([{
      meta : testMeta,
      md   : '<p>from markdown</p>',
      html : '<div>{{{md}}}</div>'
    }], {});

    assert.deepEqual(results, [{
      path : 'test.html',
      data : '<div><p>from markdown</p></div>'
    }]);
  },


  'passes partials to mustache': function () {
    var results = renderer.render([{
      meta : testMeta,
      some : 'stuff',
      html : '<div>{{>heading}}</div>'
    }], {
      heading : '<h1>{{some}}</h1>'
    });

    assert.deepEqual(results, [{
      path : 'test.html',
      data : '<div><h1>stuff</h1></div>'
    }]);
  },


  'does not create file object if html is missing': function () {
    var results = renderer.render([{ meta : { path : 'unknown' } }]);

    assert.deepEqual(results, []);
  },


  'logs a warning if html is missing': function () {
    renderer.render([{ meta : { path : 'unknown' } }]);

    sinon.assert.calledOnce(console.warn);
    sinon.assert.calledWith(console.warn, 'No html for "%s"', 'unknown');
  }

});

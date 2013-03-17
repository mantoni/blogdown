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

var renderer = require('../lib/renderer');


var testMeta = { path : 'test' };


test('renderer', {

  before: function () {
    sinon.stub(console, 'warn');
  },

  after: function () {
    console.warn.restore();
  },

  'returns empty array': function () {
    var result = renderer.render([], {});

    assert.deepEqual(result, []);
  },


  'returns array with objects of path and html': function () {
    var result = renderer.render([{
      meta : testMeta,
      md   : '<p>from markdown</p>'
    }], {
      test : '<div>{{{md}}}</div>'
    });

    assert.deepEqual(result, [{
      path : 'test',
      html : '<div><p>from markdown</p></div>'
    }]);
  },


  'passes partials to mustache': function () {
    var result = renderer.render([{
      meta : testMeta,
      some : 'stuff'
    }], {
      test    : '<div>{{>heading}}</div>',
      heading : '<h1>{{some}}</h1>'
    });

    assert.deepEqual(result, [{
      path : 'test',
      html : '<div><h1>stuff</h1></div>'
    }]);
  },


  'does not create file object if path is not a partial': function () {
    var result = renderer.render([{ meta : { path : 'unknown' } }], {});

    assert.deepEqual(result, []);
  },


  'logs a warning if path is not a partial': function () {
    renderer.render([{ meta : { path : 'unknown' } }], {});

    sinon.assert.calledOnce(console.warn);
    sinon.assert.calledWith(console.warn, 'No html for "%s"', 'unknown');
  },

  'replaces slash in path with dot to lookup partial': function () {
    var result = renderer.render([{ meta : { path : 'some/file' } }], {
      'some.file' : '<em>Yeah!</em>'
    });

    sinon.assert.notCalled(console.warn);
    assert.deepEqual(result, [{
      path : 'some/file',
      html : '<em>Yeah!</em>'
    }]);
  }

});

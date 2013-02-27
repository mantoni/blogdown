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


test('renderer', {

  'returns empty array': function () {
    var result = renderer.render([], {});

    assert.deepEqual(result, []);
  },


  'returns array with objects of fileName and html': function () {
    var result = renderer.render([{
      fileName : 'test',
      md       : '<p>from markdown</p>'
    }], {
      test : '<div>{{{md}}}</div>'
    });

    assert.deepEqual(result, [{
      fileName : 'test',
      html     : '<div><p>from markdown</p></div>'
    }]);
  },


  'passes partials to mustache': function () {
    var result = renderer.render([{
      fileName : 'test',
      some     : 'stuff'
    }], {
      test    : '<div>{{>heading}}</div>',
      heading : '<h1>{{some}}</h1>'
    });

    assert.deepEqual(result, [{
      fileName : 'test',
      html     : '<div><h1>stuff</h1></div>'
    }]);
  },


  'does not create file object if fileName is not a partial': function () {
    var result = renderer.render([{ fileName : 'unknown' }], {});

    assert.deepEqual(result, []);
  },


  'logs a warning if fileName is not a partial': sinon.test(function () {
    this.stub(console, 'warn');

    renderer.render([{ fileName : 'unknown' }], {});

    sinon.assert.calledOnce(console.warn);
    sinon.assert.calledWith(console.warn, 'No html for "%s"', 'unknown');
  })

});


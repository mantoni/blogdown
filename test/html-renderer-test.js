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

var mustache = require('mustache');
var renderer = require('../lib/html-renderer');


var testFile = { path : 'test.html' };


test('renderer', {

  before: function () {
    sinon.stub(console, 'warn');
  },

  after: function () {
    console.warn.restore();
  },

  'returns empty array': function () {
    var results = renderer.render([], {}, {});

    assert.deepEqual(results, []);
  },


  'returns array with objects of path and html': function () {
    var results = renderer.render([{
      file : testFile,
      md   : '<p>from markdown</p>',
      html : '<div>{{{md}}}</div>'
    }], {}, {});

    assert.deepEqual(results, [{
      path : 'test.html',
      data : '<div><p>from markdown</p></div>'
    }]);
  },


  'passes partials to mustache': function () {
    var results = renderer.render([{
      file : testFile,
      some : 'stuff',
      html : '<div>{{>heading}}</div>'
    }], {}, {
      heading : '<h1>{{some}}</h1>'
    });

    assert.deepEqual(results, [{
      path : 'test.html',
      data : '<div><h1>stuff</h1></div>'
    }]);
  },


  'does not create file object if html is missing': function () {
    var results = renderer.render([{ file : { path : 'unknown' } }], {});

    assert.deepEqual(results, []);
  },


  'logs a warning if html is missing': function () {
    renderer.render([{ file : { path : 'unknown/foo', name : 'foo' } }], {});

    sinon.assert.calledOnce(console.warn);
    sinon.assert.calledWith(console.warn, 'No html for "%s"', 'unknown/foo');
  },


  'sets all lists on each item before passing to mustache': sinon.test(
    function () {
      this.stub(mustache, 'render');
      renderer.render([{ file : testFile, html : '<html/>' }], {
        foo : [{ a : 1 }],
        bar : [{ b : 2 }]
      });

      sinon.assert.calledOnce(mustache.render);
      sinon.assert.calledWithMatch(mustache.render, '', {
        foo : [{ a : 1 }],
        bar : [{ b : 2 }]
      });
    }
  ),


  'sets item as current on context': sinon.test(function () {
    this.stub(mustache, 'render');
    var spy = sinon.spy();
    var context = Object.create({}, {
      current: {
        set: spy
      }
    });
    var item = { file : testFile, html : '</>' };

    renderer.render([item], { l : [{}, item] }, {}, context);

    sinon.assert.calledTwice(spy);
    sinon.assert.calledWith(spy, item);
    sinon.assert.calledWith(spy, null);
    sinon.assert.callOrder(spy.withArgs(item), mustache.render,
        spy.withArgs(null));
  })

});

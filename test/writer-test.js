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
var sinon  = require('sinon');

var writer = require('../lib/writer');
var fs     = require('fs');


test('writer', {

  before: function () {
    sinon.stub(fs, 'writeFile');
  },

  after: function () {
    fs.writeFile.restore();
  },

  'writes the given items to files': function () {
    writer.write([{
      fileName : 'file1',
      html     : '<h1>foo</h1>'
    }, {
      fileName : 'file2',
      html     : '<h2>bar</h2>'
    }], function () {});

    sinon.assert.calledTwice(fs.writeFile);
    sinon.assert.calledWith(fs.writeFile, 'file1.html',  '<h1>foo</h1>');
    sinon.assert.calledWith(fs.writeFile, 'file2.html',  '<h2>bar</h2>');
  },


  'yields once all files where written': function () {
    var spy = sinon.spy();

    writer.write([{
      fileName : 'file1',
      html     : '<h1>foo</h1>'
    }, {
      fileName : 'file2',
      html     : '<h2>bar</h2>'
    }], spy);

    sinon.assert.notCalled(spy);

    fs.writeFile.firstCall.invokeCallback();

    sinon.assert.notCalled(spy);

    fs.writeFile.secondCall.invokeCallback();

    sinon.assert.calledOnce(spy);
  }

});


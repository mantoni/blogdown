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
    sinon.stub(fs, 'mkdir');
  },

  after: function () {
    fs.writeFile.restore();
    fs.mkdir.restore();
  },

  'writes the given items to files': function () {
    writer.write([{
      path : 'file1',
      html : '<h1>foo</h1>'
    }, {
      path : 'file2',
      html : '<h2>bar</h2>'
    }], 'site', function () {});

    sinon.assert.calledTwice(fs.writeFile);
    sinon.assert.calledWith(fs.writeFile, 'site/file1.html',  '<h1>foo</h1>');
    sinon.assert.calledWith(fs.writeFile, 'site/file2.html',  '<h2>bar</h2>');
  },


  'yields once all files where written': function () {
    var spy = sinon.spy();

    writer.write([{
      path : 'file1',
      html : '<h1>foo</h1>'
    }, {
      path : 'file2',
      html : '<h2>bar</h2>'
    }], '.', spy);

    sinon.assert.notCalled(spy);

    fs.writeFile.firstCall.invokeCallback();

    sinon.assert.notCalled(spy);

    fs.writeFile.secondCall.invokeCallback();

    sinon.assert.calledOnce(spy);
  },

  'creates directory for path before writing file': function () {
    writer.write([{
      path : 'folder/file',
      html : ''
    }], 'target', function () {});

    sinon.assert.notCalled(fs.writeFile);
    sinon.assert.calledOnce(fs.mkdir);
    sinon.assert.calledWith(fs.mkdir, 'target/folder');

    fs.mkdir.invokeCallback();

    sinon.assert.calledOnce(fs.writeFile);
  },

  'errs and does not create file if mkdir fails': function () {
    var spy = sinon.spy();
    var err = new Error();
    fs.mkdir.yields(err);

    writer.write([{
      path : 'folder/file',
      html : ''
    }], '.', spy);

    sinon.assert.notCalled(fs.writeFile);
    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  }

});


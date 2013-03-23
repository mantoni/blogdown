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

var fs     = require('fs');
var writer = require('../lib/file-writer');


test('writer', {

  before: function () {
    sinon.stub(fs, 'writeFile');
    sinon.stub(fs, 'mkdirSync');
    sinon.stub(fs, 'existsSync');
  },

  after: function () {
    fs.writeFile.restore();
    fs.mkdirSync.restore();
    fs.existsSync.restore();
  },

  'writes the given items to files': function () {
    writer.write([{
      path : 'file1.html',
      data : '<h1>foo</h1>'
    }, {
      path : 'file2.json',
      data : '{"h1":"bar"}'
    }], 'site', function () {});

    sinon.assert.calledTwice(fs.writeFile);
    sinon.assert.calledWith(fs.writeFile, 'site/file1.html',  '<h1>foo</h1>');
    sinon.assert.calledWith(fs.writeFile, 'site/file2.json',  '{"h1":"bar"}');
  },


  'yields once all files where written': function () {
    var spy = sinon.spy();

    writer.write([{
      path : 'file1.html',
      data : ''
    }, {
      path : 'file2.json',
      data : ''
    }], '.', spy);

    sinon.assert.notCalled(spy);

    fs.writeFile.firstCall.invokeCallback();

    sinon.assert.notCalled(spy);

    fs.writeFile.secondCall.invokeCallback();

    sinon.assert.calledOnce(spy);
  },

  'creates directory for path before writing file': function () {
    writer.write([{
      path : 'folder/file.json',
      data : ''
    }], 'target', function () {});

    sinon.assert.calledWith(fs.mkdirSync, 'target');
    sinon.assert.calledWith(fs.mkdirSync, 'target/folder');
    sinon.assert.calledOnce(fs.writeFile);
    sinon.assert.callOrder(fs.mkdirSync, fs.writeFile);
  },

  'errs and does not create file if mkdir for root fails': function () {
    var spy = sinon.spy();
    var err = new Error();
    fs.mkdirSync.withArgs('site').throws(err);

    writer.write([{
      path : 'folder/file.json',
      data : ''
    }], 'site', spy);

    sinon.assert.notCalled(fs.writeFile);
    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },

  'errs and does not create file if mkdir for folder fails': function () {
    var spy = sinon.spy();
    var err = new Error();
    fs.mkdirSync.withArgs('./folder').throws(err);

    writer.write([{
      path : 'folder/file.json',
      data : ''
    }], '.', spy);

    sinon.assert.notCalled(fs.writeFile);
    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },

  'does not mkdir if folder already exists': function () {
    fs.existsSync.returns(true);

    writer.write([{
      path : 'folder/file.json',
      data : ''
    }], 'target', function () {});

    sinon.assert.calledTwice(fs.existsSync);
    sinon.assert.calledWith(fs.existsSync, 'target');
    sinon.assert.calledWith(fs.existsSync, 'target/folder');
    sinon.assert.notCalled(fs.mkdirSync);
    sinon.assert.calledOnce(fs.writeFile);
  }

});


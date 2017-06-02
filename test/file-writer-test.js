/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test = require('utest');
var sinon = require('sinon');

var fs = require('fs');
var writer = require('../lib/file-writer');


test('writer', {

  before: function () {
    sinon.stub(fs, 'readFile');
    sinon.stub(fs, 'writeFile');
    sinon.stub(fs, 'mkdirSync');
    sinon.stub(fs, 'existsSync');
    sinon.stub(fs, 'exists');
    sinon.stub(process.stdout, 'write');
  },

  after: function () {
    fs.readFile.restore();
    fs.writeFile.restore();
    fs.mkdirSync.restore();
    fs.existsSync.restore();
    fs.exists.restore();
    process.stdout.write.restore();
  },

  'writes the given items to files': function () {
    fs.exists.yields(false);

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
    fs.exists.yields(false);
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
    fs.exists.yields(false);

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
    fs.exists.yields(false);
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
    fs.exists.yields(false);
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
    fs.exists.yields(false);
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
  },

  'does not mkdir if file already exists': function () {
    fs.exists.yields(true);
    fs.existsSync.returns(true);

    writer.write([{
      path : 'folder/file.json',
      data : ''
    }], 'target', function () {});

    sinon.assert.calledOnce(fs.exists);
    sinon.assert.calledWith(fs.exists, 'target/folder/file.json');
    sinon.assert.notCalled(fs.mkdirSync);
  },

  'reads file content if it already exists': function () {
    fs.exists.yields(true);

    writer.write([{
      path : 'file.html',
      data : '<h1>foo</h1>'
    }], 'site', function () {});

    sinon.assert.calledOnce(fs.exists);
    sinon.assert.calledWith(fs.exists, 'site/file.html');
    sinon.assert.calledOnce(fs.readFile);
    sinon.assert.calledWith(fs.readFile, 'site/file.html');
    sinon.assert.notCalled(fs.writeFile);
  },

  'writes file if content is different': function () {
    fs.exists.yields(true);
    fs.readFile.yields(null, new Buffer('<h1>bar</h1>'));

    writer.write([{
      path : 'file.html',
      data : '<h1>foo</h1>'
    }], 'site', function () {});

    sinon.assert.calledOnce(fs.writeFile);
    sinon.assert.calledWith(fs.writeFile, 'site/file.html', '<h1>foo</h1>');
  },

  'does not write file if content is same': function () {
    fs.exists.yields(true);
    fs.readFile.yields(null, new Buffer('<h1>foo</h1>'));

    writer.write([{
      path : 'file.html',
      data : '<h1>foo</h1>'
    }], 'site', function () {});

    sinon.assert.notCalled(fs.writeFile);
  },

  'does not write file if read failed': function () {
    fs.exists.yields(true);
    var error = new Error('Oh noes!');
    fs.readFile.yields(error);
    var spy = sinon.spy();

    writer.write([{
      path : 'file.html',
      data : '<h1>foo</h1>'
    }], 'site', spy);

    sinon.assert.notCalled(fs.writeFile);
    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, error);
  },

  'yields if file was not written': function () {
    fs.exists.yields(true);
    fs.readFile.yields(null, new Buffer('<h1>foo</h1>'));
    var spy = sinon.spy();

    writer.write([{
      path : 'file.html',
      data : '<h1>foo</h1>'
    }], 'site', spy);

    sinon.assert.calledOnce(spy);
  }

});


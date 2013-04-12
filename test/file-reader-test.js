/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test       = require('utest');
var assert     = require('assert');
var sinon      = require('sinon');

var fs         = require('fs');
var fileReader = require('../lib/file-reader');


test('file-reader', {

  before: function () {
    sinon.stub(fs, 'exists').yields(false);
    sinon.stub(fs, 'readFile');
  },

  after: function () {
    fs.exists.restore();
    fs.readFile.restore();
  },


  'reads and returns a json file with the given path': function () {
    fs.exists.withArgs('some/test.json').yields(true);
    fs.readFile.withArgs('some/test.json').yields(null,
      new Buffer('{"some":"json"}'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, { some : 'json' });
  },


  'errs if json file cannot be read': function () {
    var err = new Error('Oups!');
    fs.exists.withArgs('some/test.json').yields(true);
    fs.readFile.withArgs('some/test.json').yields(err);
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'reads and returns parsed markdown in a json object': function () {
    fs.exists.withArgs('some/test.md').yields(true);
    fs.readFile.withArgs('some/test.md').yields(null,
        new Buffer('_markdown_'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      md : '<p><em>markdown</em></p>'
    });
  },


  'errs if markdown file cannot be read': function () {
    var err = new Error('Oups!');
    fs.exists.withArgs('some/test.md').yields(true);
    fs.readFile.withArgs('some/test.md').yields(err);
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'reads and returns html in a json object': function () {
    fs.exists.withArgs('some/test.html').yields(true);
    fs.readFile.withArgs('some/test.html').yields(null,
        new Buffer('<b>html</b>'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, { html : '<b>html</b>' });
  },


  'reads and returns mustache in a json object': function () {
    fs.exists.withArgs('some/test.mustache').yields(true);
    fs.readFile.withArgs('some/test.mustache').yields(null,
        new Buffer('<b>{{mustache}}</b>'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, { html : '<b>{{mustache}}</b>' });
  },


  'errs if html file cannot be read': function () {
    var err = new Error('Oups!');
    fs.exists.withArgs('some/test.html').yields(true);
    fs.readFile.withArgs('some/test.html').yields(err);
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'combines json and markdown results': function () {
    fs.exists.withArgs('some/test.json').yields(true);
    fs.exists.withArgs('some/test.md').yields(true);
    fs.readFile.withArgs('some/test.json').yields(null,
        new Buffer('{"some":"json"}'));
    fs.readFile.withArgs('some/test.md').yields(null,
        new Buffer('_markdown_'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      some     : 'json',
      md       : '<p><em>markdown</em></p>'
    });
  },


  'adds name and path to file object': function () {
    fs.exists.withArgs('some/test.json').yields(true);
    fs.readFile.withArgs('some/test.json').yields(null, new Buffer('{}'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      file   : {
        name : 'test',
        path : 'some/test.html'
      }
    });
  },


  'does not replace existing name property and uses it in path': function () {
    fs.exists.withArgs('some/test.json').yields(true);
    fs.readFile.withArgs('some/test.json').yields(null,
        new Buffer('{"file":{"name":"custom-name"}}'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      file   : {
        name : 'custom-name',
        path : 'some/custom-name.html'
      }
    });
  },


  'file.active is false by default': function () {
    fs.exists.withArgs('some/test.json').yields(true);
    fs.readFile.withArgs('some/test.json').yields(null, new Buffer('{}'));
    var item, context = {};

    fileReader.read('some/test',  context, function (err, result) {
      item = result;
    });

    assert.strictEqual(item.file.active, false);
  },


  'file.active is true if item is equal to context.current': function () {
    fs.exists.withArgs('some/test.json').yields(true);
    fs.readFile.withArgs('some/test.json').yields(null, new Buffer('{}'));
    var item, context = {};

    fileReader.read('some/test',  context, function (err, result) {
      item = result;
    });
    context.current = item;

    assert(item.file.active);
  },


  'file.path does not contain context.root portion': function () {
    fs.exists.withArgs('a/b/test.json').yields(true);
    fs.readFile.withArgs('a/b/test.json').yields(null, new Buffer('{}'));
    var item;

    fileReader.read('a/b/test', { root : 'a' }, function (err, result) {
      item = result;
    });

    assert.equal(item.file.path, 'b/test.html');
  },


  'file.path is relative to current item': function () {
    fs.exists.withArgs('a/b/test.json').yields(true);
    fs.readFile.withArgs('a/b/test.json').yields(null, new Buffer('{}'));
    var item, context = {
      root    : 'a',
      current : { file : { path : 'c/file.html' } }
    };

    fileReader.read('a/b/test',  context, function (err, result) {
      item = result;
    });

    assert.equal(item.file.path, '../b/test.html');
  },


  'file.path is relative to current item in same folder': function () {
    fs.exists.withArgs('a/b/test.json').yields(true);
    fs.readFile.withArgs('a/b/test.json').yields(null, new Buffer('{}'));
    var item, context = {
      root    : 'a',
      current : { file : { path : 'b/file.html' } }
    };

    fileReader.read('a/b/test',  context, function (err, result) {
      item = result;
    });

    assert.equal(item.file.path, 'test.html');
  },


  'file.root is relative to context.root': function () {
    fs.exists.withArgs('a/b/c/test.json').yields(true);
    fs.readFile.withArgs('a/b/c/test.json').yields(null, new Buffer('{}'));
    var item;

    fileReader.read('a/b/c/test', { root : 'a' }, function (err, result) {
      item = result;
    });

    assert.equal(item.file.root, '../..');
  },


  'file.root is empty for root items': function () {
    fs.exists.withArgs('a/test.json').yields(true);
    fs.readFile.withArgs('a/test.json').yields(null, new Buffer('{}'));
    var item;

    fileReader.read('a/test', { root : 'a' }, function (err, result) {
      item = result;
    });

    assert.equal(item.file.root, '.');
  }

});

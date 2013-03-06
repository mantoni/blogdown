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

var fileReader = require('../lib/file-reader');
var fs         = require('fs');


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

    fileReader.read('some/test', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {  some : 'json' });
  },


  'errs if json file cannot be read': function () {
    var err = new Error('Oups!');
    fs.exists.withArgs('some/test.json').yields(true);
    fs.readFile.withArgs('some/test.json').yields(err);
    var spy = sinon.spy();

    fileReader.read('some/test', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'reads and returns parsed markdown in a json object': function () {
    fs.exists.withArgs('some/test.md').yields(true);
    fs.readFile.withArgs('some/test.md').yields(null,
        new Buffer('_markdown_'));
    var spy = sinon.spy();

    fileReader.read('some/test', spy);

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

    fileReader.read('some/test', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'reads and returns html in a json object': function () {
    fs.exists.withArgs('some/test.html').yields(true);
    fs.readFile.withArgs('some/test.html').yields(null,
        new Buffer('<b>html</b>'));
    var spy = sinon.spy();

    fileReader.read('some/test', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, { html : '<b>html</b>' });
  },


  'errs if hmtl file cannot be read': function () {
    var err = new Error('Oups!');
    fs.exists.withArgs('some/test.html').yields(true);
    fs.readFile.withArgs('some/test.html').yields(err);
    var spy = sinon.spy();

    fileReader.read('some/test', spy);

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

    fileReader.read('some/test', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, {
      path     : 'some/test',
      fileName : 'test',
      some     : 'json',
      md       : '<p><em>markdown</em></p>'
    });
  }

});

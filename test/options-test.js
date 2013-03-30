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
var options    = require('../lib/options');


test('options read', {

  before: function () {
    sinon.stub(fileReader, 'read');
  },

  after: function () {
    fileReader.read.restore();
  },


  'reads file using the given path': function () {
    options.read('some/path', function () {});

    sinon.assert.calledOnce(fileReader.read);
    sinon.assert.calledWith(fileReader.read, 'some/path');
  },


  'yields error from file reader': function () {
    var spy = sinon.spy();
    var err = new Error();
    fileReader.read.yields(err);

    options.read('some/path', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'yields item without "file" info from file reader': function () {
    var spy    = sinon.spy();
    var result = { some : 'options', file : { name : 'foo' } };
    fileReader.read.yields(null, result);

    options.read('path', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, { some : 'options' });
  }

});

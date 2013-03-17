/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test      = require('utest');
var assert    = require('assert');
var sinon     = require('sinon');

var blogdown  = require('../lib/blogdown');
var reader    = require('../lib/item-reader');
var processor = require('../lib/item-processor');
var renderer  = require('../lib/html-renderer');
var writer    = require('../lib/file-writer');


test('blogdown', {

  before: function () {
    sinon.stub(reader, 'read');
    sinon.stub(writer, 'write');
    sinon.stub(processor, 'process');
    sinon.stub(renderer, 'render');
    this.options = { dateFormat : 'dd.MM.YYYY' };
  },

  after: function () {
    reader.read.restore();
    writer.write.restore();
    processor.process.restore();
    renderer.render.restore();
  },


  'reads the given source': function () {
    blogdown('some/source', 'some/target', this.options, function () {});

    sinon.assert.calledOnce(reader.read);
    sinon.assert.calledWith(reader.read, 'some/source');
  },


  'processes items from reader yield with options': function () {
    var data = { items : [{ some : 'item' }], partials : {} };
    reader.read.yields(null, data);

    blogdown('some/source', 'some/target', this.options, function () {});

    sinon.assert.calledOnce(processor.process);
    sinon.assert.calledWith(processor.process, [{ some : 'item' }],
        'some/source', this.options);
  },


  'renders items after processing': function () {
    var data = { items : [{ some : 'item' }], partials : {} };
    reader.read.yields(null, data);

    blogdown('some/source', 'some/target', this.options, function () {});

    sinon.assert.calledOnce(renderer.render);
    sinon.assert.calledWith(renderer.render, data.items, data.partials);
    sinon.assert.callOrder(processor.process, renderer.render);
  },


  'writes renderer return value': function () {
    reader.read.yields(null, {});
    var files = [{ fileName : 'foo', html : '...' }];
    renderer.render.returns(files);

    blogdown('some/source', 'some/target', this.options, function () {});

    sinon.assert.calledOnce(writer.write);
    sinon.assert.calledWith(writer.write, files, 'some/target');
  },


  'yields once writer yields': function () {
    reader.read.yields(null, {});
    var spy = sinon.spy();

    blogdown('some/source', 'some/target', this.options, spy);

    sinon.assert.notCalled(spy);

    writer.write.invokeCallback();

    sinon.assert.calledOnce(spy);
  },


  'yields error and does not continue if reader errs': function () {
    var err = new Error('ouch');
    reader.read.yields(err);
    var spy = sinon.spy();

    blogdown('some/source', 'some/target', this.options, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
    sinon.assert.notCalled(processor.process);
    sinon.assert.notCalled(renderer.render);
    sinon.assert.notCalled(writer.write);
  },


  'yields error if processor throws': function () {
    var err = new Error('ouch');
    var spy = sinon.spy();
    processor.process.throws(err);
    reader.read.yields(null, {});

    blogdown('some/source', 'some/target', this.options, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'yields error if renderer throws': function () {
    var err = new Error('ouch');
    var spy = sinon.spy();
    renderer.render.throws(err);
    reader.read.yields(null, {});

    blogdown('some/source', 'some/target', this.options, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  }

});

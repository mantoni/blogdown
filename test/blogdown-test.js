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
var reader    = require('../lib/reader');
var processor = require('../lib/item-processor');
var renderer  = require('../lib/html-renderer');
var writer    = require('../lib/file-writer');
var list      = require('../lib/list');


test('blogdown', {

  before: function () {
    sinon.stub(reader, 'read');
    sinon.stub(writer, 'write');
    sinon.stub(processor, 'process');
    sinon.stub(renderer, 'render');
    sinon.stub(list, 'createAll');
    this.options = { dates : { someFormat : 'dd.MM.YYYY' } };
  },

  after: function () {
    reader.read.restore();
    writer.write.restore();
    processor.process.restore();
    renderer.render.restore();
    list.createAll.restore();
  },


  'reads the given source': function () {
    blogdown('some/source', 'some/target', this.options, function () {});

    sinon.assert.calledOnce(reader.read);
    sinon.assert.calledWith(reader.read, 'some/source', {});
  },


  'processes items from reader yield with options': function () {
    var item = { file : { path : 'some/source/foo' }, some : 'item' };
    reader.read.yields(null, { items : [item], partials : {} });

    blogdown('some/source', 'some/target', this.options, function () {});

    sinon.assert.calledOnce(processor.process);
    sinon.assert.calledWith(processor.process, [item],
        'some/source', this.options);
  },


  'creates lists after processig': function () {
    var item = { file : { path : 'src/foo' }, some : 'item' };
    var items = [item];
    reader.read.yields(null, { items : items, partials : {} });

    blogdown('src', 'site', this.options, function () {});

    sinon.assert.calledOnce(list.createAll);
    sinon.assert.calledWith(list.createAll, items, this.options.lists);
    sinon.assert.callOrder(processor.process, list.createAll);
  },


  'renders items after processing': function () {
    list.createAll.returns({});
    var item = { file : { path : 'src/foo' }, some : 'item' };
    reader.read.yields(null, { items : [item], partials : { p : '<p/>' } });

    blogdown('src', 'site', this.options, function () {});

    sinon.assert.calledOnce(renderer.render);
    sinon.assert.calledWith(renderer.render, [item], {}, { p : '<p/>' });
    sinon.assert.callOrder(processor.process, renderer.render);
  },


  'passes lists to render': function () {
    var lists = { foo : [{ n : 1 }] };
    list.createAll.returns(lists);
    var item = { file : { path : 'src/foo' }, some : 'item' };
    reader.read.yields(null, { items : [item], partials : {} });

    blogdown('src', 'site', this.options, function () {});

    sinon.assert.calledOnce(renderer.render);
    sinon.assert.calledWith(renderer.render, [item], lists, {});
    sinon.assert.callOrder(processor.process, renderer.render);
  },


  'removes source directory from path': function () {
    var foo = { file : { path : 'source/the/foo' } };
    var bar = { file : { path : 'source/the/bar' } };
    reader.read.yields(null, {
      items : [foo, bar]
    });

    blogdown('source', 'target', this.options, function () {});

    assert.equal(foo.file.path, 'the/foo');
    assert.equal(bar.file.path, 'the/bar');
  },


  'writes renderer return value': function () {
    reader.read.yields(null, { items : [] });
    var files = [{ path : 'the/foo', html : '...' }];
    renderer.render.returns(files);

    blogdown('source', 'target', this.options, function () {});

    sinon.assert.calledOnce(writer.write);
    sinon.assert.calledWith(writer.write, [{
      path : 'the/foo',
      html : '...'
    }], 'target');
  },


  'yields once writer yields': function () {
    reader.read.yields(null, { items : [] });
    renderer.render.returns([]);
    var spy = sinon.spy();

    blogdown('source', 'target', this.options, spy);

    sinon.assert.notCalled(spy);

    writer.write.invokeCallback();

    sinon.assert.calledOnce(spy);
  },


  'yields error and does not continue if reader errs': function () {
    var err = new Error('ouch');
    reader.read.yields(err);
    renderer.render.returns([]);
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
    reader.read.yields(null, { items : [] });
    renderer.render.returns([]);

    blogdown('some/source', 'some/target', this.options, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'yields error if renderer throws': function () {
    var err = new Error('ouch');
    var spy = sinon.spy();
    renderer.render.throws(err);
    reader.read.yields(null, { items : [] });
    renderer.render.returns([]);

    blogdown('some/source', 'some/target', this.options, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  }

});

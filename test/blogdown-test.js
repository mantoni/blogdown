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
var meta      = require('../lib/meta');


var EMPTY_META_RESULT = {
  created : [],
  updated : [],
  deleted : [],
  meta    : {}
};


var createMetaWithCreated = function (items) {
  return {
    created : items,
    updated : [],
    deleted : [],
    meta    : {}
  };
};

var createMetaWithUpdated = function (items) {
  return {
    created : [],
    updated : items,
    deleted : [],
    meta    : {}
  };
};


test('blogdown', {

  before: function () {
    sinon.stub(reader, 'read');
    sinon.stub(writer, 'write');
    sinon.stub(processor, 'process');
    sinon.stub(renderer, 'render');
    sinon.stub(list, 'createAll');
    sinon.stub(meta, 'update');
    sinon.stub(meta, 'persist');
    this.options = { dates : { someFormat : 'dd.MM.YYYY' } };
  },

  after: function () {
    reader.read.restore();
    writer.write.restore();
    processor.process.restore();
    renderer.render.restore();
    list.createAll.restore();
    meta.update.restore();
    meta.persist.restore();
  },


  'reads the given source': function () {
    blogdown('some/source', 'some/target', this.options, function () {});

    sinon.assert.calledOnce(reader.read);
    sinon.assert.calledWith(reader.read, 'some/source', {});
  },


  'updates meta with items from reader': function () {
    var item = { file : { path : 'some/source/foo' }, some : 'item' };
    reader.read.yields(null, { items : [item], partials : {} });

    blogdown('some/source', 'some/target', this.options, function () {});

    sinon.assert.calledOnce(meta.update);
    sinon.assert.calledWith(meta.update, 'blogdown.meta', [item]);
    sinon.assert.notCalled(processor.process);
  },

  'processes items from reader using given options': function () {
    var item = { file : { path : 'some/source/foo' }, some : 'item' };
    reader.read.yields(null, { items : [item], partials : {} });
    meta.update.yields(null, EMPTY_META_RESULT);

    blogdown('some/source', 'some/target', this.options, function () {});

    sinon.assert.called(processor.process);
    sinon.assert.calledWith(processor.process, [item],
        'some/source', this.options);
  },


  'creates lists after processing with items from reader': function () {
    var item = { file : { path : 'src/foo' }, some : 'item' };
    var items = [item];
    reader.read.yields(null, { items : items, partials : {} });
    meta.update.yields(null, EMPTY_META_RESULT);

    blogdown('src', 'site', this.options, function () {});

    sinon.assert.calledOnce(list.createAll);
    sinon.assert.calledWith(list.createAll, items, this.options.lists);
    sinon.assert.callOrder(processor.process, list.createAll);
  },


  'renders items after processing': function () {
    list.createAll.returns({});
    var item = { file : { path : 'src/foo' }, some : 'item' };
    reader.read.yields(null, { items : [], partials : { p : '<p/>' } });
    meta.update.yields(null, createMetaWithCreated([item]));

    blogdown('src', 'site', this.options, function () {});

    sinon.assert.calledOnce(renderer.render);
    sinon.assert.calledWith(renderer.render, [item], {}, { p : '<p/>' });
    sinon.assert.callOrder(processor.process, renderer.render);
  },


  'passes lists to render': function () {
    var lists = { foo : [{ n : 1 }] };
    list.createAll.returns(lists);
    var item = { file : { path : 'src/foo' }, some : 'item' };
    reader.read.yields(null, { items : [], partials : {} });
    meta.update.yields(null, createMetaWithCreated([item]));

    blogdown('src', 'site', this.options, function () {});

    sinon.assert.calledOnce(renderer.render);
    sinon.assert.calledWith(renderer.render, [item], lists, {});
    sinon.assert.callOrder(processor.process, renderer.render);
  },


  'passes same context into renderer that was passed to lists': function () {
    reader.read.yields(null, { items : [], partials : {} });
    meta.update.yields(null, EMPTY_META_RESULT);

    blogdown('src', 'site', this.options, function () {});

    var context = renderer.render.firstCall.args[3];
    assert.equal(typeof context, 'object');
    assert.strictEqual(context, list.createAll.firstCall.args[2]);
    assert.equal(context.root, 'src');
  },


  'writes renderer return value': function () {
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, EMPTY_META_RESULT);
    var files = [{ path : 'the/foo', html : '...' }];
    renderer.render.returns(files);

    blogdown('source', 'target', this.options, function () {});

    sinon.assert.calledOnce(writer.write);
    sinon.assert.calledWith(writer.write, [{
      path : 'the/foo',
      html : '...'
    }], 'target');
  },


  'errs if writer errs': function () {
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, EMPTY_META_RESULT);
    renderer.render.returns([]);
    var err = new Error();
    var spy = sinon.spy();

    blogdown('source', 'target', this.options, spy);

    sinon.assert.notCalled(spy);

    writer.write.invokeCallback(err);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'passes meta to meta.persist once writer yields': function () {
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, {
      created : [],
      updated : [],
      deleted : [],
      meta    : { some : 'meta' }
    });
    renderer.render.returns([]);
    writer.write.yields();

    blogdown('source', 'target', this.options, function () {});

    sinon.assert.calledOnce(meta.persist);
    sinon.assert.calledWith(meta.persist, 'blogdown.meta', { some : 'meta' });
  },


  'yields once meta.persist yields': function () {
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, EMPTY_META_RESULT);
    renderer.render.returns([]);
    writer.write.yields();
    var spy = sinon.spy();

    blogdown('source', 'target', this.options, spy);

    sinon.assert.notCalled(spy);

    meta.persist.invokeCallback();

    sinon.assert.calledOnce(spy);
  },


  'logs files that may be deleted': sinon.test(function () {
    this.stub(console, 'warn');
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, {
      created : [],
      updated : [],
      deleted : ['deleted.html', 'files.html']
    });
    renderer.render.returns([]);
    writer.write.yields();

    blogdown('source', 'target', this.options, function () {});

    sinon.assert.called(console.warn);
    sinon.assert.calledWith(console.warn,
      '  rm target/deleted.html target/files.html');
  }),


  'yields error and does not continue if reader errs': function () {
    var err = new Error('ouch');
    reader.read.yields(err);
    var spy = sinon.spy();

    blogdown('some/source', 'some/target', this.options, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
    sinon.assert.notCalled(meta.update);
    sinon.assert.notCalled(processor.process);
    sinon.assert.notCalled(renderer.render);
    sinon.assert.notCalled(writer.write);
    sinon.assert.notCalled(meta.persist);
  },


  'yields error and does not continue if meta errs': function () {
    var err = new Error('ouch');
    reader.read.yields(null, { items : [] });
    meta.update.yields(err);
    var spy = sinon.spy();

    blogdown('some/source', 'some/target', this.options, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
    sinon.assert.notCalled(processor.process);
    sinon.assert.notCalled(renderer.render);
    sinon.assert.notCalled(writer.write);
    sinon.assert.notCalled(meta.persist);
  },


  'yields error if processor throws': function () {
    var err = new Error('ouch');
    var spy = sinon.spy();
    processor.process.throws(err);
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, EMPTY_META_RESULT);
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
    meta.update.yields(null, EMPTY_META_RESULT);
    renderer.render.returns([]);

    blogdown('some/source', 'some/target', this.options, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  }

});

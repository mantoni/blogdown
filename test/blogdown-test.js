/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*eslint-env mocha*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var blogdown = require('../lib/blogdown');
var reader = require('../lib/reader');
var processor = require('../lib/item-processor');
var renderer = require('../lib/html-renderer');
var writer = require('../lib/file-writer');
var list = require('../lib/list');
var meta = require('../lib/meta');


var EMPTY_META_RESULT = {
  created: [],
  updated: [],
  missing: [],
  deleted: [],
  meta: {}
};

describe('blogdown', function () {
  var sandbox;
  var options;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(reader, 'read');
    sandbox.stub(writer, 'write');
    sandbox.stub(processor, 'process');
    sandbox.stub(renderer, 'render');
    sandbox.stub(list, 'createAll');
    sandbox.stub(meta, 'update');
    sandbox.stub(meta, 'persist');
    options = { dates : { someFormat : 'dd.MM.YYYY' } };
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('reads the given source', function () {
    blogdown('some/source', 'some/target', options, function () {});

    sinon.assert.calledOnce(reader.read);
    sinon.assert.calledWith(reader.read, 'some/source', {});
  });

  it('reads the given source with publish set to true', function () {
    options.meta = { publish : true };

    blogdown('some/source', 'some/target', options, function () {});

    sinon.assert.calledOnce(reader.read);
    sinon.assert.calledWith(reader.read, 'some/source', {});
  });

  it('updates meta with items from reader', function () {
    var item = { file : { path : 'some/source/foo' }, some : 'item' };
    reader.read.yields(null, { items : [item], partials : {} });

    blogdown('some/source', 'some/target', options, function () {});

    sinon.assert.calledOnce(meta.update);
    sinon.assert.calledWith(meta.update, [item]);
    sinon.assert.notCalled(processor.process);
  });

  it('passes meta options with target dir to meta', function () {
    reader.read.yields(null, { items : [], partials : {} });
    options.meta = { file : 'other.meta' };

    blogdown('some/source', 'some/target', options, function () {});

    sinon.assert.calledWith(meta.update, [], {
      file   : 'other.meta',
      target : 'some/target'
    });
  });

  it('defauts meta options to object with target', function () {
    reader.read.yields(null, { items : [], partials : {} });

    blogdown('some/source', 'some/target', options, function () {});

    sinon.assert.calledWith(meta.update, [], { target : 'some/target' });
  });

  it('processes items from reader using given options', function () {
    var item = { file : { path : 'some/source/foo' }, some : 'item' };
    reader.read.yields(null, { items : [item], partials : {} });
    meta.update.yields(null, EMPTY_META_RESULT);

    blogdown('some/source', 'some/target', options, function () {});

    sinon.assert.called(processor.process);
    sinon.assert.calledWith(processor.process, [item],
        'some/source', options);
  });

  it('creates lists after processing with items from reader', function () {
    var item = { file : { path : 'src/foo' }, some : 'item' };
    var items = [item];
    reader.read.yields(null, { items : items, partials : {} });
    meta.update.yields(null, EMPTY_META_RESULT);

    blogdown('src', 'site', options, function () {});

    sinon.assert.calledOnce(list.createAll);
    sinon.assert.calledWith(list.createAll, items, options.lists);
    sinon.assert.callOrder(processor.process, list.createAll);
  });

  it('renders items after processing', function () {
    list.createAll.returns({});
    var item = { file : { path : 'src/foo' }, some : 'item' };
    reader.read.yields(null, { items : [item], partials : { p : '<p/>' } });
    meta.update.yields(null, EMPTY_META_RESULT);

    blogdown('src', 'site', options, function () {});

    sinon.assert.calledOnce(renderer.render);
    sinon.assert.calledWith(renderer.render, [item], {}, { p : '<p/>' });
    sinon.assert.callOrder(processor.process, renderer.render);
  });

  it('renders all items after processing if --force', function () {
    list.createAll.returns({});
    var item = { file : { path : 'src/foo' }, some : 'item' };
    reader.read.yields(null, { items : [item], partials : { p : '<p/>' } });
    meta.update.yields(null, EMPTY_META_RESULT);
    options.force = true;

    blogdown('src', 'site', options, function () {});

    sinon.assert.calledOnce(renderer.render);
    sinon.assert.calledWith(renderer.render, [item], {}, { p : '<p/>' });
    sinon.assert.callOrder(processor.process, renderer.render);
  });

  it('passes lists to render', function () {
    var lists = { foo : [{ n : 1 }] };
    list.createAll.returns(lists);
    var item = { file : { path : 'src/foo' }, some : 'item' };
    reader.read.yields(null, { items : [item], partials : {} });
    meta.update.yields(null, EMPTY_META_RESULT);

    blogdown('src', 'site', options, function () {});

    sinon.assert.calledOnce(renderer.render);
    sinon.assert.calledWith(renderer.render, [item], lists, {});
    sinon.assert.callOrder(processor.process, renderer.render);
  });

  it('passes same context into renderer that was passed to lists', function () {
    reader.read.yields(null, { items : [], partials : {} });
    meta.update.yields(null, EMPTY_META_RESULT);

    blogdown('src', 'site', options, function () {});

    var context = renderer.render.firstCall.args[3];
    assert.equal(typeof context, 'object');
    assert.strictEqual(context, list.createAll.firstCall.args[2]);
    assert.equal(context.root, 'src');
  });

  it('writes renderer return value', function () {
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, EMPTY_META_RESULT);
    var files = [{ path : 'the/foo', html : '...' }];
    renderer.render.returns(files);

    blogdown('source', 'target', options, function () {});

    sinon.assert.calledOnce(writer.write);
    sinon.assert.calledWith(writer.write, [{
      path : 'the/foo',
      html : '...'
    }], 'target');
  });

  it('errs if writer errs', function () {
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, EMPTY_META_RESULT);
    renderer.render.returns([]);
    var err = new Error();
    var spy = sinon.spy();

    blogdown('source', 'target', options, spy);

    sinon.assert.notCalled(spy);

    writer.write.invokeCallback(err);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  });

  it('passes meta to meta.persist once writer yields', function () {
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, {
      created : [],
      updated : [],
      missing : [],
      deleted : [],
      meta    : { some : 'meta' }
    });
    renderer.render.returns([]);
    writer.write.yields();
    options.meta = { publish : true };

    blogdown('source', 'target', options, function () {});

    sinon.assert.calledOnce(meta.persist);
    sinon.assert.calledWith(meta.persist, { some : 'meta' });
  });

  it('passes meta options to meta.persist', function () {
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, EMPTY_META_RESULT);
    renderer.render.returns([]);
    writer.write.yields();
    options.meta = { file : 'other.meta', publish : true };

    blogdown('source', 'target', options, function () {});

    sinon.assert.calledOnce(meta.persist);
    sinon.assert.calledWithMatch(meta.persist, {}, { file : 'other.meta' });
  });

  it('yields once meta.persist yields', function () {
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, EMPTY_META_RESULT);
    renderer.render.returns([]);
    writer.write.yields();
    options.meta = { publish : true };
    var spy = sinon.spy();

    blogdown('source', 'target', options, spy);

    sinon.assert.notCalled(spy);

    meta.persist.invokeCallback();

    sinon.assert.calledOnce(spy);
  });

  it('yields without persisting if publish is false', function () {
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, EMPTY_META_RESULT);
    renderer.render.returns([]);
    writer.write.yields();
    var spy = sinon.spy();

    blogdown('source', 'target', options, spy);

    sinon.assert.notCalled(meta.persist);
    sinon.assert.calledOnce(spy);
  });

  it('logs files that may be deleted', function () {
    sandbox.stub(console, 'warn');
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, {
      created : [],
      updated : [],
      missing : [],
      deleted : ['deleted.html', 'files.html']
    });
    renderer.render.returns([]);
    writer.write.yields();

    blogdown('source', 'target', options, function () {});

    sinon.assert.called(console.warn);
    sinon.assert.calledWith(console.warn,
      '  rm target/deleted.html target/files.html');
  });

  it('yields error and does not continue if reader errs', function () {
    var err = new Error('ouch');
    reader.read.yields(err);
    var spy = sinon.spy();

    blogdown('some/source', 'some/target', options, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
    sinon.assert.notCalled(meta.update);
    sinon.assert.notCalled(processor.process);
    sinon.assert.notCalled(renderer.render);
    sinon.assert.notCalled(writer.write);
    sinon.assert.notCalled(meta.persist);
  });

  it('yields error and does not continue if meta errs', function () {
    var err = new Error('ouch');
    reader.read.yields(null, { items : [] });
    meta.update.yields(err);
    var spy = sinon.spy();

    blogdown('some/source', 'some/target', options, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
    sinon.assert.notCalled(processor.process);
    sinon.assert.notCalled(renderer.render);
    sinon.assert.notCalled(writer.write);
    sinon.assert.notCalled(meta.persist);
  });

  it('yields error if processor throws', function () {
    var err = new Error('ouch');
    var spy = sinon.spy();
    processor.process.throws(err);
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, EMPTY_META_RESULT);
    renderer.render.returns([]);

    blogdown('some/source', 'some/target', options, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  });

  it('yields error if renderer throws', function () {
    var err = new Error('ouch');
    var spy = sinon.spy();
    renderer.render.throws(err);
    reader.read.yields(null, { items : [] });
    meta.update.yields(null, EMPTY_META_RESULT);

    blogdown('some/source', 'some/target', options, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  });

});

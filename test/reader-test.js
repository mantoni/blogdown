/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*eslint-env mocha*/
'use strict';

var sinon = require('sinon');
var reader = require('../lib/reader');
var merger = require('../lib/merger');
var resolver = require('../lib/resolver');
var templateReader = require('../lib/template-reader');
var itemReader = require('../lib/item-reader');
var folderReader = require('../lib/folder-reader');


describe('reader', function () {
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(templateReader, 'read');
    sandbox.stub(itemReader, 'read');
    sandbox.stub(folderReader, 'readFolders');
    sandbox.stub(console, 'info');
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('reads items', function () {
    templateReader.read.yields(null, {});

    reader.read('x/y', {}, {});

    sinon.assert.calledOnce(itemReader.read);
    sinon.assert.calledWith(itemReader.read, 'x/y', {}, sinon.match.func);
  });

  it('reads folders', function () {
    templateReader.read.yields(null, {});
    itemReader.read.yields(null, []);

    reader.read('x/y', {}, {}, function () {});

    sinon.assert.calledOnce(folderReader.readFolders);
    sinon.assert.calledWith(folderReader.readFolders, 'x/y');
  });

  it('invokes read recursively for each folder', function () {
    templateReader.read.yields(null, {});
    itemReader.read.yields(null, []);
    sandbox.spy(reader, 'read');

    reader.read('x/y', {}, {}, function () {});
    folderReader.readFolders.firstCall.invokeCallback(null, ['a', 'b']);

    sinon.assert.calledThrice(reader.read);
    sinon.assert.calledWith(reader.read, 'x/y/a');
    sinon.assert.calledWith(reader.read, 'x/y/b');
  });

  it('does not invoke read recursively for template folder', function () {
    templateReader.read.yields(null, {});
    folderReader.readFolders.yields(null, ['template']);
    sandbox.spy(reader, 'read');

    reader.read('x/y', {}, {}, function () {});

    sinon.assert.calledOnce(reader.read);
  });

  it('yields item reader results', function () {
    templateReader.read.yields(null, {});
    var result = [{ file : { name : 'x/y/z' } }];
    itemReader.read.yields(null, result);
    folderReader.readFolders.yields(null, []);
    var spy = sinon.spy();

    reader.read('x/y', {}, {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, { items : result });
  });

  it('yields item reader error', function () {
    templateReader.read.yields(null, {});
    var err = new Error();
    itemReader.read.yields(err);
    folderReader.readFolders.yields(null, []);
    var spy = sinon.spy();

    reader.read('x/y', {}, {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  });

  it('yields recursive invocation results merged with item reader results',
    function () {
      templateReader.read.yields(null, {});
      var spy = sinon.spy();

      reader.read('x/y', {}, {}, spy);
      itemReader.read.firstCall.invokeCallback(null, [{ p1 : 1 }]);
      folderReader.readFolders.firstCall.invokeCallback(null, ['a', 'b']);
      itemReader.read.secondCall.invokeCallback(null, [{ p2 : 2 }]);
      itemReader.read.thirdCall.invokeCallback(null, [{ p3 : 3 }]);
      folderReader.readFolders.secondCall.invokeCallback(null, []);
      folderReader.readFolders.thirdCall.invokeCallback(null, []);

      sinon.assert.calledOnce(spy);
      sinon.assert.calledWith(spy, null, {
        items : [sinon.match({ p1 : 1 }),
          sinon.match({ p2 : 2 }), sinon.match({ p3 : 3 })]
      });
    });

  it('creates template with given parent template', function () {
    var parentTemplate = { some : 'template' };

    reader.read('x', parentTemplate, {}, function () {});

    sinon.assert.calledOnce(templateReader.read);
    sinon.assert.calledWith(templateReader.read, 'x', parentTemplate);
  });

  it('yields error from template', function () {
    var err = new Error();
    templateReader.read.yields(err);
    itemReader.read.yields(null, []);
    folderReader.readFolders.yields(null, []);
    var spy = sinon.spy();

    reader.read('x', {}, {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  });

  it('merges template result into items', function () {
    sandbox.stub(merger, 'apply');
    var items    = [{}, { v : 42 }];
    var template = { json : { html : '<html/>', some : 'data' } };
    templateReader.read.yields(null, template);
    itemReader.read.yields(null, items);
    folderReader.readFolders.yields(null, []);

    reader.read('x', {}, {}, function () {});

    sinon.assert.calledOnce(merger.apply);
    sinon.assert.calledWith(merger.apply, items, template.json);
  });

  it('does not replace existing html', function () {
    sandbox.stub(merger, 'apply');
    var items    = [{ html : '<blockquote/>' }];
    var template = { json : { html : '<html/>' } };
    templateReader.read.yields(null, template);
    itemReader.read.yields(null, items);
    folderReader.readFolders.yields(null, []);

    reader.read('x', {}, {}, function () {});

    sinon.assert.calledOnce(merger.apply);
    sinon.assert.calledWith(merger.apply,
      [sinon.match.has('html', '<blockquote/>')], template.json);
  });

  it('uses resolver with merged data', function () {
    sandbox.stub(resolver, 'resolve');
    var items    = [{ heading : 'First' }, { heading : 'Second' }];
    var template = { json : { file : { name : '{heading}' } } };
    templateReader.read.yields(null, template);
    itemReader.read.yields(null, items);
    folderReader.readFolders.yields(null, []);

    reader.read('x', {}, {}, function () {});

    sinon.assert.calledTwice(resolver.resolve);
    sinon.assert.calledWith(resolver.resolve, {
      file    : { name : '{heading}' },
      heading : 'First'
    });
    sinon.assert.calledWith(resolver.resolve, {
      file    : { name : '{heading}' },
      heading : 'Second'
    });
  });

});

/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test           = require('utest');
var assert         = require('assert');
var sinon          = require('sinon');

var reader         = require('../lib/reader');
var merger         = require('../lib/merger');
var templateReader = require('../lib/template-reader');
var itemReader     = require('../lib/item-reader');
var folderReader   = require('../lib/folder-reader');
var fileReader     = require('../lib/file-reader');
var itemLinker     = require('../lib/item-linker');


test('reader', {

  before: function () {
    sinon.stub(templateReader, 'read');
    sinon.stub(itemReader, 'read');
    sinon.stub(folderReader, 'readFolders');
  },

  after: function () {
    templateReader.read.restore();
    itemReader.read.restore();
    folderReader.readFolders.restore();
  },


  'reads items': function () {
    templateReader.read.yields(null, {});

    reader.read('x/y', {});

    sinon.assert.calledOnce(itemReader.read);
    sinon.assert.calledWith(itemReader.read, 'x/y', sinon.match.func);
  },


  'reads folders': function () {
    templateReader.read.yields(null, {});
    itemReader.read.yields(null, []);

    reader.read('x/y', {}, function () {});

    sinon.assert.calledOnce(folderReader.readFolders);
    sinon.assert.calledWith(folderReader.readFolders, 'x/y');
  },


  'invokes read recursively for each folder': sinon.test(function () {
    templateReader.read.yields(null, {});
    itemReader.read.yields(null, []);
    this.spy(reader, 'read');

    reader.read('x/y', {}, function () {});
    folderReader.readFolders.firstCall.invokeCallback(null, ['a', 'b']);

    sinon.assert.calledThrice(reader.read);
    sinon.assert.calledWith(reader.read, 'x/y/a');
    sinon.assert.calledWith(reader.read, 'x/y/b');
  }),


  'does not invoke read recursively for template folder': sinon.test(
    function () {
      templateReader.read.yields(null, {});
      folderReader.readFolders.yields(null, ['template']);
      this.spy(reader, 'read');

      reader.read('x/y', {}, function () {});

      sinon.assert.calledOnce(reader.read);
    }
  ),


  'yields item reader results': function () {
    templateReader.read.yields(null, {});
    var result = [{ meta : { fileName : 'x/y/z' } }];
    itemReader.read.yields(null, result);
    folderReader.readFolders.yields(null, []);
    var spy = sinon.spy();

    reader.read('x/y', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, { items : result });
  },


  'yields item reader error': function () {
    templateReader.read.yields(null, {});
    var err = new Error();
    itemReader.read.yields(err);
    folderReader.readFolders.yields(null, []);
    var spy = sinon.spy();

    reader.read('x/y', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'yields recursive invocation results merged with item reader results':
    function () {
      templateReader.read.yields(null, {});
      var spy = sinon.spy();

      reader.read('x/y', {}, spy);
      itemReader.read.firstCall.invokeCallback(null, [{ p1 : 1 }]);
      folderReader.readFolders.firstCall.invokeCallback(null, ['a', 'b']);
      itemReader.read.secondCall.invokeCallback(null, [{ p2 : 2 }]);
      itemReader.read.thirdCall.invokeCallback(null, [{ p3 : 3 }]);
      folderReader.readFolders.secondCall.invokeCallback(null, []);
      folderReader.readFolders.thirdCall.invokeCallback(null, []);

      sinon.assert.calledOnce(spy);
      var items = spy.firstCall.args[1].items;
      assert.equal(items[0].p1, 1);
      assert.equal(items[1].link.child[0].p2, 2);
      assert.equal(items[2].link.child[0].p3, 3);
    },


  'creates template with given parent template': function () {
    var parentTemplate = { some : 'template' };

    reader.read('x', parentTemplate, function () {});

    sinon.assert.calledOnce(templateReader.read);
    sinon.assert.calledWith(templateReader.read, 'x', parentTemplate);
  },


  'yields error from template': function () {
    var err = new Error();
    templateReader.read.yields(err);
    itemReader.read.yields(null, []);
    folderReader.readFolders.yields(null, []);
    var spy = sinon.spy();

    reader.read('x', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'merges template result into items': sinon.test(function () {
    this.stub(merger, 'apply');
    var items    = [{}, { v : 42 }];
    var template = { json : { html : '<html/>', some : 'data' } };
    templateReader.read.yields(null, template);
    itemReader.read.yields(null, items);
    folderReader.readFolders.yields(null, []);

    reader.read('x', {}, function () {});

    sinon.assert.calledOnce(merger.apply);
    sinon.assert.calledWith(merger.apply, items, template.json);
  }),


  'does not replace existing html': sinon.test(function () {
    this.stub(merger, 'apply');
    var items    = [{ html : '<blockquote/>' }];
    var template = { json : { html : '<html/>' } };
    templateReader.read.yields(null, template);
    itemReader.read.yields(null, items);
    folderReader.readFolders.yields(null, []);

    reader.read('x', {}, function () {});

    sinon.assert.calledOnce(merger.apply);
    sinon.assert.calledWith(merger.apply,
      [sinon.match.has('html', '<blockquote/>')], template.json);
  }),


  'adds link object to results': function () {
    templateReader.read.yields(null, {});
    itemReader.read.yields(null, [{}]);
    folderReader.readFolders.yields(null, []);
    var spy = sinon.spy();

    reader.read('x', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, {
      items : [{ link : sinon.match.object }]
    });
  },


  'passes items to itemLinker.previousNext': sinon.test(function () {
    this.stub(itemLinker, 'previousNext');
    templateReader.read.yields(null, {});
    var firstItem  = {};
    var secondItem = {};
    itemReader.read.yields(null, [firstItem, secondItem]);

    reader.read('x', {}, function () {});

    sinon.assert.calledOnce(itemLinker.previousNext);
    sinon.assert.calledWith(itemLinker.previousNext, [firstItem, secondItem]);
  }),


  'passes items to itemLinker.sibling': sinon.test(function () {
    this.stub(itemLinker, 'sibling');
    templateReader.read.yields(null, {});
    var firstItem  = {};
    var secondItem = {};
    itemReader.read.yields(null, [firstItem, secondItem]);

    reader.read('x', {}, function () {});

    sinon.assert.calledOnce(itemLinker.sibling);
    sinon.assert.calledWith(itemLinker.sibling, [firstItem, secondItem]);
  }),


  'passes items to itemLinker.parentChild': sinon.test(function () {
    this.spy(reader, 'read');
    this.stub(itemLinker, 'parentChild');
    templateReader.read.yields(null, {});
    var firstParentItem  = { meta : { fileName : 'p1' } };
    var secondParentItem = { meta : { fileName : 'p2' } };
    var firstChildItem   = { meta : { fileName : 'c1' } };
    var secondChildItem  = { meta : { fileName : 'c2' } };
    var thirdChildItem   = { meta : { fileName : 'c3' } };

    reader.read('x', {}, function () {});
    itemReader.read.invokeCallback(null, [firstParentItem, secondParentItem]);
    folderReader.readFolders.invokeCallback(null, ['a', 'b']);
    reader.read.secondCall.invokeCallback(null, {
      items : [firstChildItem, secondChildItem]
    });
    reader.read.thirdCall.invokeCallback(null, {
      items : [thirdChildItem]
    });

    var virtualItemA = { meta : { dirName : 'a', path : 'x/a' }, link : {} };
    var virtualItemB = { meta : { dirName : 'b', path : 'x/b' }, link : {} };
    sinon.assert.calledThrice(itemLinker.parentChild);
    sinon.assert.calledWith(itemLinker.parentChild,
        [virtualItemA], [firstChildItem, secondChildItem]);
    sinon.assert.calledWith(itemLinker.parentChild,
        [virtualItemB], [thirdChildItem]);
    sinon.assert.calledWith(itemLinker.parentChild,
        [firstParentItem, secondParentItem], [virtualItemA, virtualItemB]);
  })

});

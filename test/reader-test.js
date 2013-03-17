/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test         = require('utest');
var assert       = require('assert');
var sinon        = require('sinon');

var reader       = require('../lib/reader');
var folderReader = require('../lib/folder-reader');
var fileReader   = require('../lib/file-reader');
var itemLinker   = require('../lib/item-linker');


test('reader', {

  before: function () {
    sinon.stub(folderReader, 'readFiles');
    sinon.stub(folderReader, 'readFolders');
    sinon.stub(fileReader, 'read');
  },

  after: function () {
    folderReader.readFiles.restore();
    folderReader.readFolders.restore();
    fileReader.read.restore();
  },


  'reads the given directory with folder-reader': function () {
    reader.read('a/b/c', function () {});

    sinon.assert.calledOnce(folderReader.readFiles);
    sinon.assert.calledWith(folderReader.readFiles, 'a/b/c');
    sinon.assert.calledOnce(folderReader.readFolders);
    sinon.assert.calledWith(folderReader.readFolders, 'a/b/c');
  },


  'passes readFiles results to file-reader': function () {
    folderReader.readFiles.yields(null, ['a/b', 'c/d']);

    reader.read('x/y/z', function () {});

    sinon.assert.calledTwice(fileReader.read);
    sinon.assert.calledWith(fileReader.read, 'x/y/z/a/b');
    sinon.assert.calledWith(fileReader.read, 'x/y/z/c/d');
  },


  'passes readFolders results to folder-reader': function () {
    folderReader.readFolders.yields(null, ['a/b', 'c/d']);

    reader.read('x/y/z', function () {});

    sinon.assert.calledThrice(folderReader.readFiles);
    sinon.assert.calledWith(folderReader.readFiles, 'x/y/z/a/b');
    sinon.assert.calledWith(folderReader.readFiles, 'x/y/z/c/d');
  },


  'splits up item as partial and item': function () {
    folderReader.readFolders.yields(null, []);
    folderReader.readFiles.yields(null, ['some.json']);
    fileReader.read.yields(null, {
      meta       : {
        path     : 'x/test',
        fileName : 'test'
      },
      html       : '<i>hi</i>',
      some       : 'data'
    });
    var spy = sinon.spy();

    reader.read('x', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, {
      items      : [sinon.match({
        some     : 'data'
      })],
      partials   : {
        test     : '<i>hi</i>'
      }
    });
  },


  'adds folder items by name to item map and partials': function () {
    folderReader.readFolders.yields(null, ['folder']);
    folderReader.readFiles.yields(null, ['some.json']);
    var spy = sinon.spy();

    reader.read('x', spy);
    fileReader.read.firstCall.invokeCallback(null, {
      meta       : {
        path     : 'x/test',
        fileName : 'test'
      },
      html       : '<i>hi</i>',
      some       : 'data'
    });
    fileReader.read.secondCall.invokeCallback(null, {
      meta       : {
        path     : 'x/folder/name',
        fileName : 'name'
      },
      html       : '<i>there</i>',
      some       : 42
    });

    sinon.assert.calledOnce(spy);
    var result    = spy.firstCall.args[1];
    var firstItem = result.items[0];
    assert.equal(firstItem.some, 'data');
    assert.equal(firstItem.link.folder.map.name.some, 42);
    assert.deepEqual(result.partials, {
      test          : '<i>hi</i>',
      'folder.name' : '<i>there</i>'
    });
  },


  'does not add folder items if no data': function () {
    folderReader.readFolders.yields(null, ['folder']);
    folderReader.readFiles.yields(null, ['some.json']);
    var spy = sinon.spy();

    reader.read('x', spy);
    fileReader.read.firstCall.invokeCallback(null, {
      meta       : {
        path     : 'x/test',
        fileName : 'test'
      },
      html       : '<i>hi</i>',
      some       : 'data'
    });
    fileReader.read.secondCall.invokeCallback(null, {
      meta       : {
        path     : 'x/folder/name',
        fileName : 'name'
      },
      html       : '<i>there</i>'
    });

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      items : [sinon.match.any]
    });
    sinon.assert.neverCalledWithMatch(spy, null, {
      items : [sinon.match.has('folder')]
    });
  },


  'adds child list': function () {
    folderReader.readFiles.yields(null, ['some.json']);
    folderReader.readFolders.yields(null, ['a', 'b']);
    var spy = sinon.spy();

    reader.read('x', spy);
    fileReader.read.firstCall.invokeCallback(null, {
      meta       : {
        path     : 'x/test',
        fileName : 'test'
      },
      some       : 'data'
    });
    fileReader.read.secondCall.invokeCallback(null, {
      meta       : {
        path     : 'x/a/name',
        fileName : 'name'
      },
      content    : 'a'
    });
    fileReader.read.thirdCall.invokeCallback(null, {
      meta       : {
        path     : 'x/b/name',
        fileName : 'name'
      },
      content    : 'b'
    });

    var firstItem = spy.firstCall.args[1].items[0];
    assert.equal(firstItem.link.a.list[0].content, 'a');
    assert.equal(firstItem.link.b.list[0].content, 'b');
  },


  'adds timestamp to meta': sinon.test(function () {
    folderReader.readFolders.yields(null, []);
    folderReader.readFiles.yields(null, ['a/b']);
    fileReader.read.yields(null, {
      meta       : {
        path     : 'test',
        fileName : 'test'
      },
      some       : 'data'
    });
    var spy = sinon.spy();

    reader.read('x', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      items : [sinon.match.has('meta',
                sinon.match.has('timestamp', '1970-01-01T01:00:00+01:00'))]
    });
  }),


  'adds link object to results': function () {
    folderReader.readFolders.yields(null, []);
    folderReader.readFiles.yields(null, ['a/b']);
    fileReader.read.yields(null, {
      meta       : {
        path     : 'test',
        fileName : 'test'
      },
      some       : 'data'
    });
    var spy = sinon.spy();

    reader.read('x', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      items : [sinon.match.has('link', sinon.match.object)]
    });
  },


  'passes items to itemLinker.previousNext': sinon.test(function () {
    this.stub(itemLinker, 'previousNext');
    folderReader.readFolders.yields(null, []);
    folderReader.readFiles.yields(null, ['a', 'b']);
    var firstItem = {
      meta       : {
        path     : 'x/test',
        fileName : 'test'
      },
      some       : 'data'
    };
    var secondItem = {
      meta       : {
        path     : 'x/folder/name',
        fileName : 'name'
      },
      some       : 42
    };

    reader.read('x', function () {});
    fileReader.read.firstCall.invokeCallback(null, firstItem);
    fileReader.read.secondCall.invokeCallback(null, secondItem);

    sinon.assert.calledOnce(itemLinker.previousNext);
    sinon.assert.calledWith(itemLinker.previousNext,
        [sinon.match.has('some', 'data'), sinon.match.has('some', 42)]);
  })

});


test('reader integration', {

  'returns json with partials and items': function () {
    var spy = sinon.spy();

    reader.read('test/fixture/simple', function (err, result) {
      if (err) {
        throw err;
      }

      assert.deepEqual(result.partials, {
        foo : '<h1>{{foo.a}}</h1>',
        doo : '<div>{{{bar.md}}}</div>'
      });
      assert.equal(result.items.length, 2);
      assert.equal(result.items[0].meta.fileName, 'bar');
      assert.equal(result.items[0].x, 'text');
      assert.equal(result.items[0].md, '<p><em>hello world</em></p>');
      assert.equal(result.items[1].meta.fileName, 'foo');
      assert.equal(result.items[1].a, 'abc');
      assert.equal(result.items[1].b, 42);

      assert.strictEqual(result.items[0].link.next, result.items[1]);
      assert.strictEqual(result.items[1].link.previous, result.items[0]);
    });
  }

});

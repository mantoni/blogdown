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
      path     : 'x/test',
      fileName : 'test',
      html     : '<i>hi</i>',
      some     : 'data'
    });
    var spy = sinon.spy();

    reader.read('x', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, {
      items      : [sinon.match({
        path     : 'test',
        fileName : 'test',
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
      path     : 'x/test',
      fileName : 'test',
      html     : '<i>hi</i>',
      some     : 'data'
    });
    fileReader.read.secondCall.invokeCallback(null, {
      path     : 'x/folder/name',
      fileName : 'name',
      html     : '<i>there</i>',
      some     : 42
    });

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, {
      items             : [sinon.match({
        path            : 'test',
        fileName        : 'test',
        some            : 'data',
        folder          : {
          map           : {
            name        : sinon.match({
              path      : 'folder/name',
              fileName  : 'name',
              some      : 42
            })
          }
        }
      }), sinon.match({
        path            : 'folder/name',
        fileName        : 'name',
        some            : 42
      })],
      partials          : {
        test            : '<i>hi</i>',
        'folder.name'   : '<i>there</i>'
      }
    });
  },


  'does not add folder items if no data': function () {
    folderReader.readFolders.yields(null, ['folder']);
    folderReader.readFiles.yields(null, ['some.json']);
    var spy = sinon.spy();

    reader.read('x', spy);
    fileReader.read.firstCall.invokeCallback(null, {
      path     : 'x/test',
      fileName : 'test',
      html     : '<i>hi</i>',
      some     : 'data'
    });
    fileReader.read.secondCall.invokeCallback(null, {
      path     : 'x/folder/name',
      fileName : 'name',
      html     : '<i>there</i>'
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
      path     : 'x/test',
      fileName : 'test',
      some     : 'data'
    });
    fileReader.read.secondCall.invokeCallback(null, {
      path     : 'x/a/name',
      fileName : 'name',
      content  : 'a'
    });
    fileReader.read.thirdCall.invokeCallback(null, {
      path     : 'x/b/name',
      fileName : 'name',
      content  : 'b'
    });

    var firstItem = spy.firstCall.args[1].items[0];
    assert.equal(firstItem.a.list[0].content, 'a');
    assert.equal(firstItem.b.list[0].content, 'b');
  },


  'adds timestamp to result': sinon.test(function () {
    folderReader.readFolders.yields(null, []);
    folderReader.readFiles.yields(null, ['a/b']);
    fileReader.read.yields(null, {
      path     : 'test',
      fileName : 'test',
      some     : 'data'
    });
    var spy = sinon.spy();

    reader.read('x', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      items : [sinon.match.has('timestamp', '1970-01-01T01:00:00+01:00')]
    });
  }),


  'passes items to itemLinker.previousNext': sinon.test(function () {
    this.stub(itemLinker, 'previousNext');
    folderReader.readFolders.yields(null, []);
    folderReader.readFiles.yields(null, ['a', 'b']);
    var firstItem = {
      path     : 'x/test',
      fileName : 'test',
      some     : 'data'
    };
    var secondItem = {
      path     : 'x/folder/name',
      fileName : 'name',
      some     : 42
    };

    reader.read('x', function () {});
    fileReader.read.firstCall.invokeCallback(null, firstItem);
    fileReader.read.secondCall.invokeCallback(null, secondItem);

    sinon.assert.calledOnce(itemLinker.previousNext);
    sinon.assert.calledWith(itemLinker.previousNext, [firstItem, secondItem]);
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
      assert.equal(result.items[0].fileName, 'bar');
      assert.equal(result.items[0].x, 'text');
      assert.equal(result.items[0].md, '<p><em>hello world</em></p>');
      assert.equal(result.items[1].fileName, 'foo');
      assert.equal(result.items[1].a, 'abc');
      assert.equal(result.items[1].b, 42);

      assert.strictEqual(result.items[0].next, result.items[1]);
      assert.strictEqual(result.items[1].previous, result.items[0]);
    });
  }

});

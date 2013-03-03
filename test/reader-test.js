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


test('reader', {

  before: function () {
    sinon.stub(folderReader, 'readFiles');
    sinon.stub(fileReader, 'read');
  },

  after: function () {
    folderReader.readFiles.restore();
    fileReader.read.restore();
  },


  'reads the given directory with folder-reader': function () {
    reader.read('a/b/c', function () {});

    sinon.assert.calledOnce(folderReader.readFiles);
    sinon.assert.calledWith(folderReader.readFiles, 'a/b/c');
  },


  'passes folder-reader results to file-reader': function () {
    folderReader.readFiles.yields(null, ['a/b', 'c/d']);

    reader.read('x/y/z', function () {});

    sinon.assert.calledTwice(fileReader.read);
    sinon.assert.calledWith(fileReader.read, 'x/y/z/a/b');
    sinon.assert.calledWith(fileReader.read, 'x/y/z/c/d');
  },


  'splits up item aspartial and item': function () {
    folderReader.readFiles.yields(null, ['some.json']);
    fileReader.read.yields(null, {
      fileName : 'test',
      html     : '<i>hi</i>',
      some     : 'data'
    });
    var spy = sinon.spy();

    reader.read('x', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, {
      items    : [sinon.match({ fileName : 'test', some : 'data' })],
      partials : {
        test   : '<i>hi</i>'
      }
    });
  },


  'adds timestamp to result': sinon.test(function () {
    folderReader.readFiles.yields(null, ['a/b']);
    fileReader.read.yields(null, { fileName : 'test', some : 'data' });
    var spy = sinon.spy();

    reader.read('x', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      items : [sinon.match.has('timestamp', '1970-01-01T01:00:00+01:00')]
    });
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
      assert.strictEqual(result.items[1].prev, result.items[0]);
    });
  }

});

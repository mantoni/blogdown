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
var folderReader = require('../lib/folder-reader');
var fileReader = require('../lib/file-reader');
var reader = require('../lib/item-reader');

describe('reader', function () {

  beforeEach(function () {
    sinon.stub(folderReader, 'readFiles');
    sinon.stub(fileReader, 'read');
  });

  afterEach(function () {
    folderReader.readFiles.restore();
    fileReader.read.restore();
  });

  it('reads the given directory with folder-reader', function () {
    reader.read('a/b/c', {}, function () {});

    sinon.assert.calledOnce(folderReader.readFiles);
    sinon.assert.calledWith(folderReader.readFiles, 'a/b/c');
  });

  it('passes readFiles results to file-reader', function () {
    folderReader.readFiles.yields(null, ['a', 'b']);

    reader.read('x/y/z', {}, function () {});

    sinon.assert.calledTwice(fileReader.read);
    sinon.assert.calledWith(fileReader.read, 'x/y/z/a');
    sinon.assert.calledWith(fileReader.read, 'x/y/z/b');
  });

  it('returns items from read results', function () {
    folderReader.readFiles.yields(null, ['any']);
    var item = {
      file   : {
        path : 'x/test',
        name : 'test'
      },
      html   : '<i>hi</i>'
    };
    fileReader.read.yields(null, item);
    var spy = sinon.spy();

    reader.read('x', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, [item]);
  });

  it('does not include template item in result', function () {
    folderReader.readFiles.yields(null, ['template']);

    reader.read('x', {}, function () {});

    sinon.assert.notCalled(fileReader.read);
  });

});

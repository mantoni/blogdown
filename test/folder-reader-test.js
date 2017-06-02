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
var fs = require('fs');
var folderReader = require('../lib/folder-reader');

function testFileNames(suffix) {
  return function () {
    fs.readdir.withArgs('some/test').yields(null,
      ['a.' + suffix, 'b.doc', 'c.' + suffix, 'd.doc']);
    var spy = sinon.spy();

    folderReader.readFiles('some/test', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, ['a', 'c']);
  };
}

describe('folder-reader readFiles', function () {

  beforeEach(function () {
    sinon.stub(fs, 'readdir');
  });

  afterEach(function () {
    fs.readdir.restore();
  });

  it('invokes given callback with json files', testFileNames('json'));

  it('invokes given callback with md files', testFileNames('md'));

  it('invokes given callback with html files', testFileNames('html'));

  it('invokes given callback with mustache files', testFileNames('mustache'));

  it('yields error if readdir fails', function () {
    var err = new Error('Oups!');
    fs.readdir.withArgs('some/failure').yields(err);
    var spy = sinon.spy();

    folderReader.readFiles('some/failure', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  });

});

describe('folder-reader readFolders', function () {

  beforeEach(function () {
    sinon.stub(fs, 'readdir');
    sinon.stub(fs, 'stat').yields(null, {
      isDirectory : sinon.stub().returns(false)
    });
  });

  afterEach(function () {
    fs.readdir.restore();
    fs.stat.restore();
  });

  it('invokes given callback with folder names', function () {
    fs.readdir.withArgs('some/test').yields(null, ['a', 'b', 'c']);
    fs.stat.withArgs('some/test/b').yields(null, {
      isDirectory : sinon.stub().returns(true)
    });
    var spy = sinon.spy();

    folderReader.readFolders('some/test', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, ['b']);
  });

  it('yields error if readdir fails', function () {
    var err = new Error('Oups!');
    fs.readdir.withArgs('some/failure').yields(err);
    var spy = sinon.spy();

    folderReader.readFolders('some/failure', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  });

  it('yields error if stat fails', function () {
    fs.readdir.withArgs('some/test').yields(null, ['a', 'b', 'c']);
    var err = new Error('Oups!');
    fs.stat.withArgs('some/test/b').yields(err);
    var spy = sinon.spy();

    folderReader.readFolders('some/test', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  });

});

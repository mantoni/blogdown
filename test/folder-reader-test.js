/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test = require('utest');
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


test('folder-reader readFiles', {

  before: function () {
    sinon.stub(fs, 'readdir');
  },

  after: function () {
    fs.readdir.restore();
  },


  'invokes given callback with json files': testFileNames('json'),

  'invokes given callback with md files': testFileNames('md'),

  'invokes given callback with html files': testFileNames('html'),

  'invokes given callback with mustache files': testFileNames('mustache'),

  'yields error if readdir fails': function () {
    var err = new Error('Oups!');
    fs.readdir.withArgs('some/failure').yields(err);
    var spy = sinon.spy();

    folderReader.readFiles('some/failure', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  }

});


test('folder-reader readFolders', {

  before: function () {
    sinon.stub(fs, 'readdir');
    sinon.stub(fs, 'stat').yields(null, {
      isDirectory : sinon.stub().returns(false)
    });
  },

  after: function () {
    fs.readdir.restore();
    fs.stat.restore();
  },

  'invokes given callback with folder names': function () {
    fs.readdir.withArgs('some/test').yields(null, ['a', 'b', 'c']);
    fs.stat.withArgs('some/test/b').yields(null, {
      isDirectory : sinon.stub().returns(true)
    });
    var spy = sinon.spy();

    folderReader.readFolders('some/test', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, ['b']);
  },


  'yields error if readdir fails': function () {
    var err = new Error('Oups!');
    fs.readdir.withArgs('some/failure').yields(err);
    var spy = sinon.spy();

    folderReader.readFolders('some/failure', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'yields error if stat fails': function () {
    fs.readdir.withArgs('some/test').yields(null, ['a', 'b', 'c']);
    var err = new Error('Oups!');
    fs.stat.withArgs('some/test/b').yields(err);
    var spy = sinon.spy();

    folderReader.readFolders('some/test', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  }

});

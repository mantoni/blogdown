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

var folderReader = require('../lib/folder-reader');
var fs           = require('fs');


test('folder-reader readFiles', {

  before: function () {
    sinon.stub(fs, 'readdir');
  },

  after: function () {
    fs.readdir.restore();
  },


  'invokes given callback with [json|md|html] file names': function () {
    fs.readdir.withArgs('some/test').yields(null,
      ['a.md', 'a.json', 'b.md', 'c.json', 'd.doc', 'foo', 'd.html']);
    var spy = sinon.spy();

    folderReader.readFiles('some/test', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, ['a', 'b', 'c', 'd']);
  },


  'yields error if readdir fails': function () {
    var err = new Error('Oups!');
    fs.readdir.withArgs('some/failure').yields(err);
    var spy = sinon.spy();

    folderReader.readFiles('some/failure', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  }

});

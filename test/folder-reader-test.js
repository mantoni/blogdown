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


test('folder-reader', {

  before: function () {
    sinon.stub(fs, 'readdir');
  },

  after: function () {
    fs.readdir.restore();
  },


  'invokes given callback with all found [json|md] file names': function () {
    fs.readdir.withArgs('some/test').yields(null,
      ['a.md', 'a.json', 'b.md', 'c.json', 'd.doc', 'foo']);
    var spy = sinon.spy();

    folderReader.read('some/test', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, ['a', 'b', 'c']);
  },


  'yields error if readdir fails': function () {
    var err = new Error('Oups!');
    fs.readdir.withArgs('some/failure').yields(err);
    var spy = sinon.spy();

    folderReader.read('some/failure', spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  }

});

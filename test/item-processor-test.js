/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test      = require('utest');
var assert    = require('assert');
var sinon     = require('sinon');

var fs        = require('fs');
var processor = require('../lib/item-processor');


test('processor', {

  before: function () {
    sinon.stub(fs, 'existsSync').returns(false);
    this.item = {
      meta       : {
        created  : '2013-02-27T22:16:02+01:00',
        modified : '2013-02-28T23:17:03+01:00'
      }
    };
  },

  after: function () {
    fs.existsSync.restore();
  },

  'adds created and modified for timestamps using date format': function () {
    processor.process([this.item], '', {
      dateFormat : 'dddd, MMMM Do YYYY'
    });

    assert.equal(this.item.date.created, 'Wednesday, February 27th 2013');
    assert.equal(this.item.date.modified, 'Thursday, February 28th 2013');
  },


  'does not add date if not configured': function () {
    processor.process([this.item], '', {});

    assert.strictEqual(this.item.date, undefined);
  },


  'checks for processor.js in given path': function () {
    processor.process([], 'some/path', {});

    sinon.assert.calledOnce(fs.existsSync);
    sinon.assert.calledWith(fs.existsSync,
        process.cwd() + '/some/path/processor.js');
  },


  'requires and calls function exported by processor.js': function () {
    fs.existsSync.returns(true);

    processor.process([this.item], 'test/fixture', {});

    assert(this.item.iWasHere);
  }

});


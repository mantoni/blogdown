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

var processor = require('../lib/processor');


test('processor', {

  before: function () {
    this.item = {
      timestamp : '2013-02-27T22:16:02+01:00'
    };
  },


  'adds date for timestamp using date format': function () {
    processor.process([this.item], {
      dateFormat : 'dddd, MMMM Do YYYY'
    });

    assert.equal(this.item.date, 'Wednesday, February 27th 2013');
  },


  'does not add date if not configured': function () {
    processor.process([this.item], {});

    assert.strictEqual(this.item.date, undefined);
  }

});


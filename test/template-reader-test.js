/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test           = require('utest');
var assert         = require('assert');
var sinon          = require('sinon');

var fs             = require('fs');
var fileReader     = require('../lib/file-reader');
var itemReader     = require('../lib/item-reader');
var templateReader = require('../lib/template-reader');


test('template-reader', {

  before: function () {
    sinon.stub(fileReader, 'read');
    sinon.stub(itemReader, 'read');
    sinon.stub(fs, 'exists');
  },

  after: function () {
    fileReader.read.restore();
    itemReader.read.restore();
    fs.exists.restore();
  },


  'reads the "template" files from the given directory': function () {
    templateReader.read('foo/bar', {}, function () {});

    sinon.assert.calledOnce(fileReader.read);
    sinon.assert.calledWith(fileReader.read, 'foo/bar/template');
  },


  'yields error from file-reader': function () {
    var err = new Error();
    var spy = sinon.spy();
    fileReader.read.yields(err);
    fs.exists.yields(false);
    //itemReader.read.yields(null, { partials : {}, items : [] });

    templateReader.read('foo', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'checks whether a template folder exists in the given path': function () {
    templateReader.read('foo/bar', {}, function () {});

    sinon.assert.calledOnce(fs.exists);
    sinon.assert.calledWith(fs.exists, 'foo/bar/template');
  },


  'invokes items-reader if template exists': function () {
    fs.exists.yields(true);

    templateReader.read('foo', {}, function () {});

    sinon.assert.calledOnce(itemReader.read);
    sinon.assert.calledWith(itemReader.read, 'foo/template');
  },


  'does not invoke items-reader if template is missing': function () {
    fs.exists.yields(false);

    templateReader.read('foo', {}, function () {});

    sinon.assert.notCalled(itemReader.read);
  },


  'yields error from items-reader': function () {
    var err = new Error();
    var spy = sinon.spy();
    fs.exists.yields(true);
    fileReader.read.yields(null, {});
    itemReader.read.yields(err);

    templateReader.read('foo', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'yields null and fileReader results': function () {
    fileReader.read.yields(null, {
      meta : { fileName : 'template' },
      html : '<html/>',
      v    : 42
    });
    fs.exists.yields(false);
    var spy = sinon.spy();

    templateReader.read('foo/bar', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, {
      json     : { html : '<html/>', v : 42 },
      partials : {}
    });
  },


  'merges item-reader result and parent template': function () {
    var spy = sinon.spy();
    fileReader.read.yields(null, {});
    fs.exists.yields(true);
    itemReader.read.yields(null, [{
      meta : { fileName : 'a' },
      v    : 42
    }, {
      meta : { fileName : 'b' },
      html : '<b/>'
    }]);

    templateReader.read('foo', {
      partials : { p : '<p/>' },
      json     : { the : 'template' }
    }, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, {
      partials : { p : '<p/>', b : '<b/>' },
      json     : { a : { v : 42 }, the : 'template' }
    });
  },


  'merges template result and parent template': function () {
    var spy = sinon.spy();
    fileReader.read.yields(null, {
      meta : {},
      html : '<html/>',
      v    : 42
    });
    fs.exists.yields(false);

    templateReader.read('foo', {
      partials : { t1 : '<i>t</i>' },
      json     : { the : 'template' }
    }, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, {
      partials : { t1 : '<i>t</i>' },
      json     : { html : '<html/>', the : 'template', v : 42 }
    });
  },


  'merges template and item-reader results': function () {
    var spy = sinon.spy();
    fileReader.read.yields(null, {
      meta : {},
      html : '<html/>',
      v1   : 1
    });
    fs.exists.yields(true);
    itemReader.read.yields(null, [{
      meta : { fileName : 'x' },
      v2   : 2,
      html : '<p/>'
    }]);

    templateReader.read('foo', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, {
      partials : { x : '<p/>' },
      json     : { html : '<html/>', v1 : 1, x : { v2 : 2 } }
    });
  },


  'yields empty partials and json objects if no template found': function () {
    var spy = sinon.spy();
    fileReader.read.yields(null, { meta : {} });
    fs.exists.yields(false);

    templateReader.read('foo', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, {
      partials : {},
      json     : {}
    });
  },


  'yields parent template if no template found': function () {
    var spy = sinon.spy();
    fileReader.read.yields(null, { meta : {} });
    fs.exists.yields(false);

    templateReader.read('foo', {
      partials : { p : '<p/>' },
      json     : { v : 42 }
    }, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null, {
      partials : { p : '<p/>' },
      json     : { v : 42 }
    });
  }

});

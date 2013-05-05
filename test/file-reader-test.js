/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test       = require('utest');
var assert     = require('assert');
var sinon      = require('sinon');

var fs         = require('fs');
var fileReader = require('../lib/file-reader');


test('file-reader', {

  before: function () {
    sinon.stub(fs, 'exists').yields(false);
    sinon.stub(fs, 'readFile');
  },

  after: function () {
    fs.exists.restore();
    fs.readFile.restore();
  },


  'reads and returns a json file with the given path': function () {
    fs.exists.withArgs('some/test.json').yields(true);
    fs.readFile.withArgs('some/test.json').yields(null,
      new Buffer('{"some":"json"}'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, { some : 'json' });
  },


  'errs if json file cannot be read': function () {
    var err = new Error('Oups!');
    fs.exists.withArgs('some/test.json').yields(true);
    fs.readFile.withArgs('some/test.json').yields(err);
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'replaces backslashes and newlines at end of JSON file before parsing':
    function () {
      fs.exists.withArgs('some/test.json').yields(true);
      fs.readFile.withArgs('some/test.json').yields(null,
        new Buffer('{"some":"long, wrapped\n    and indented json"}'));
      var spy = sinon.spy();

      fileReader.read('some/test', {}, spy);

      sinon.assert.calledOnce(spy);
      sinon.assert.calledWithMatch(spy, null, {
        some : 'long, wrapped and indented json'
      });
    },


  'reads and returns parsed markdown in a json object': function () {
    fs.exists.withArgs('some/test.md').yields(true);
    fs.readFile.withArgs('some/test.md').yields(null,
        new Buffer('_markdown_'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      md : '<p><em>markdown</em></p>'
    });
  },


  'errs if markdown file cannot be read': function () {
    var err = new Error('Oups!');
    fs.exists.withArgs('some/test.md').yields(true);
    fs.readFile.withArgs('some/test.md').yields(err);
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'reads and returns html in a json object': function () {
    fs.exists.withArgs('some/test.html').yields(true);
    fs.readFile.withArgs('some/test.html').yields(null,
        new Buffer('<b>html</b>'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, { html : '<b>html</b>' });
  },


  'reads and returns mustache in a json object': function () {
    fs.exists.withArgs('some/test.mustache').yields(true);
    fs.readFile.withArgs('some/test.mustache').yields(null,
        new Buffer('<b>{{mustache}}</b>'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, { html : '<b>{{mustache}}</b>' });
  },


  'errs if html file cannot be read': function () {
    var err = new Error('Oups!');
    fs.exists.withArgs('some/test.html').yields(true);
    fs.readFile.withArgs('some/test.html').yields(err);
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'combines json and markdown results': function () {
    fs.exists.withArgs('some/test.json').yields(true);
    fs.exists.withArgs('some/test.md').yields(true);
    fs.readFile.withArgs('some/test.json').yields(null,
        new Buffer('{"some":"json"}'));
    fs.readFile.withArgs('some/test.md').yields(null,
        new Buffer('_markdown_'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      some : 'json',
      md   : '<p><em>markdown</em></p>'
    });
  },


  'adds name and path to file object': function () {
    fs.exists.withArgs('some/test.json').yields(true);
    fs.readFile.withArgs('some/test.json').yields(null, new Buffer('{}'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      file   : {
        name : 'test',
        path : 'some/test.html'
      }
    });
  },


  'allows to define a custom name to be used in the path': function () {
    fs.exists.withArgs('some/test.json').yields(true);
    fs.readFile.withArgs('some/test.json').yields(null,
        new Buffer('{"file":{"name":"custom-name"}}'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      file   : {
        name : 'custom-name',
        path : 'some/custom-name.html'
      }
    });
  },


  'allows to define a custom suffix to be used in the path': function () {
    fs.exists.withArgs('some/test.json').yields(true);
    fs.readFile.withArgs('some/test.json').yields(null,
        new Buffer('{"file":{"suffix":"rss"}}'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      file   : {
        name : 'test',
        path : 'some/test.rss'
      }
    });
  },


  'file.active is false by default': function () {
    var item;

    fileReader.read('some/test', {}, function (err, result) {
      item = result;
    });

    assert.strictEqual(item.file.active, false);
  },


  'file.active is true if item is equal to context.current': function () {
    var item, context = {};

    fileReader.read('some/test', context, function (err, result) {
      item = result;
    });
    context.current = item;

    assert(item.file.active);
  },


  'file.path does not contain context.root portion': function () {
    var item;

    fileReader.read('a/b/test', { root : 'a' }, function (err, result) {
      item = result;
    });

    assert.equal(item.file.path, 'b/test.html');
  },


  'file.path is relative to current item': function () {
    var item, context = {
      root    : 'a',
      current : { file : { path : 'c/file.html' } }
    };

    fileReader.read('a/b/test', context, function (err, result) {
      item = result;
    });

    assert.equal(item.file.path, '../b/test.html');
  },


  'file.path is relative to current item in same folder': function () {
    var item, context = {
      root    : 'a',
      current : { file : { path : 'b/file.html' } }
    };

    fileReader.read('a/b/test', context, function (err, result) {
      item = result;
    });

    assert.equal(item.file.path, 'test.html');
  },


  'file.path removes "index.html" if rendering': function () {
    var item;

    fileReader.read('a/b/index', { root : 'a', rendering : true },
      function (err, result) {
        item = result;
      });

    assert.equal(item.file.path, 'b/');
  },


  'file.path does not remove "index.html" if not rendering': function () {
    var item;

    fileReader.read('a/b/index', { root : 'a', rendering : false },
      function (err, result) {
        item = result;
      });

    assert.equal(item.file.path, 'b/index.html');
  },


  'relative file.path from index.html is correct': function () {
    var item, context = {
      root      : 'a',
      current   : { file : { path : 'c/' } },
      rendering : true
    };

    fileReader.read('a/b/other', context, function (err, result) {
      item = result;
    });

    assert.equal(item.file.path, '../b/other.html');
  },


  'relative file.path to index.html is correct': function () {
    var item, context = {
      root      : 'a',
      current   : { file : { path : 'c/file.html' } },
      rendering : true
    };

    fileReader.read('a/b/index', context, function (err, result) {
      item = result;
    });

    assert.equal(item.file.path, '../b/');
  },


  'relative file.path from and to index.html is correct': function () {
    var item, context = {
      root      : 'a',
      current   : { file : { path : 'c/' } },
      rendering : true
    };

    fileReader.read('a/b/index', context, function (err, result) {
      item = result;
    });

    assert.equal(item.file.path, '../b/');
  },


  'file.root is relative to context.root': function () {
    fs.exists.withArgs('a/b/c/test.json').yields(true);
    fs.readFile.withArgs('a/b/c/test.json').yields(null, new Buffer('{}'));
    var item;

    fileReader.read('a/b/c/test', { root : 'a' }, function (err, result) {
      item = result;
    });

    assert.equal(item.file.root, '../..');
  },


  'file.root is empty for root items': function () {
    fs.exists.withArgs('a/test.json').yields(true);
    fs.readFile.withArgs('a/test.json').yields(null, new Buffer('{}'));
    var item;

    fileReader.read('a/test', { root : 'a' }, function (err, result) {
      item = result;
    });

    assert.equal(item.file.root, '.');
  },


  'does not add "file" if context is null': function () {
    fs.exists.withArgs('a/test.json').yields(true);
    fs.readFile.withArgs('a/test.json').yields(null, new Buffer('{}'));
    var item;

    fileReader.read('a/test', null, function (err, result) {
      item = result;
    });

    assert.strictEqual(item.file, undefined);
  },

  'adds file.name property on prototype': function () {
    fs.exists.withArgs('a/test.json').yields(true);
    fs.readFile.withArgs('a/test.json').yields(null, new Buffer('{}'));
    var item;

    fileReader.read('a/test', {}, function (err, result) {
      item = result;
    });

    assert(!item.file.hasOwnProperty('name'));
  },

  'overrides file.name on object directly': function () {
    fs.exists.withArgs('a/test.json').yields(true);
    fs.readFile.withArgs('a/test.json').yields(null,
        new Buffer('{"file":{"name":"foo"}}'));
    var item;

    fileReader.read('a/test', {}, function (err, result) {
      item = result;
    });

    assert(item.file.hasOwnProperty('name'));
  },

  'reads multiline json at top of markdown': function () {
    fs.exists.withArgs('some/test.md').yields(true);
    fs.readFile.withArgs('some/test.md').yields(null,
        new Buffer('{\n  "some": "json"\n}\n\n_markdown_'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      md   : '<p><em>markdown</em></p>',
      some : 'json'
    });
  },

  'igores json in markdown if not on first line': function () {
    fs.exists.withArgs('some/test.md').yields(true);
    fs.readFile.withArgs('some/test.md').yields(null,
        new Buffer('\n{\n  "some": "json"\n}\n'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      md : '<p>{\n  &quot;some&quot;: &quot;json&quot;\n}</p>'
    });
  },

  'reads multiline json at top of html': function () {
    fs.exists.withArgs('some/test.html').yields(true);
    fs.readFile.withArgs('some/test.html').yields(null,
        new Buffer('{\n  "some": "json"\n}\n\n<em>html</em>'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      html : '<em>html</em>',
      some : 'json'
    });
  },

  'igores json in html if not on first line': function () {
    fs.exists.withArgs('some/test.html').yields(true);
    fs.readFile.withArgs('some/test.html').yields(null,
        new Buffer('<pre>\n{\n  "some": "json"\n}\n</pre>'));
    var spy = sinon.spy();

    fileReader.read('some/test', {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWithMatch(spy, null, {
      html : '<pre>\n{\n  "some": "json"\n}\n</pre>'
    });
  }

});

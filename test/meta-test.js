/*
 * blogdown
 *
 * Copyright (c) 2013 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var test   = require('utest');
var assert = require('assert');
var sinon  = require('sinon');

var fs     = require('fs');

var meta   = require('../lib/meta');

var timezoneOffSet = -1 * (new Date()).getTimezoneOffset() / 60;
var epocCurrentTZString = '1970-01-01T'+timezoneOffSet+':00:00+'+timezoneOffSet+':00';

function invoke(items, publish) {
  var json;
  meta.update(items, { target : 'some/target', publish : publish },
    function (err, result) {
      json = result;
    });
  return json;
}

function create(item, publish) {
  fs.exists.yields(false);
  item.file = { path : 'x' };
  return invoke([item], publish).meta.x;
}


function setFileContent(json) {
  fs.exists.yields(true);
  fs.readFile.yields(null, new Buffer(JSON.stringify(json)));
}


function update(persistedData, item, publish) {
  setFileContent({ x : persistedData });
  item.file = { path : 'x' };
  return invoke([item], arguments.length === 2 ? true : publish).meta.x;
}


var SHA_EMPTY_HTML      = 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391';
var SHA_EMPTY_CONTENT   = '9e26dfeeb6e641a33dae4961196235bdb965b21b';
var SHA_DEFAULT_HTML    = '58b78820701d32dac4450754e291bb6cf19c6e46';
var SHA_DEFAULT_CONTENT = '2801f6fa981c15818a1a7654abca07b5d4d731bc';
var SHA_UPDATED_HTML    = '';
var SHA_UPDATED_CONTENT = '';


test('meta update', {

  before: function () {
    sinon.stub(fs, 'exists');
    sinon.stub(fs, 'existsSync');
    sinon.stub(fs, 'readFile');
    sinon.stub(fs, 'writeFile');
    this.clock = sinon.useFakeTimers();
  },

  after: function () {
    fs.exists.restore();
    fs.existsSync.restore();
    fs.readFile.restore();
    fs.writeFile.restore();
    this.clock.restore();
  },

  'checks whether file with default path exists': function () {
    meta.update([], {});

    sinon.assert.calledOnce(fs.exists);
    sinon.assert.calledWith(fs.exists, 'blogdown.meta', sinon.match.func);
  },


  'checks whether file with given path exists': function () {
    meta.update([], { file : 'some/path.json' });

    sinon.assert.calledOnce(fs.exists);
    sinon.assert.calledWith(fs.exists, 'some/path.json', sinon.match.func);
  },


  'reads file from default path if it exists': function () {
    fs.exists.yields(true);

    meta.update([], {});

    sinon.assert.calledOnce(fs.readFile);
    sinon.assert.calledWith(fs.readFile, 'blogdown.meta', sinon.match.func);
  },


  'reads file from given path if it exists': function () {
    fs.exists.yields(true);

    meta.update([], { file : 'some/path.json' });

    sinon.assert.calledOnce(fs.readFile);
    sinon.assert.calledWith(fs.readFile, 'some/path.json', sinon.match.func);
  },


  'yields and does not read file from given path if not there': function () {
    fs.exists.yields(false);
    var spy = sinon.spy();

    meta.update([], { file : 'foo' }, spy);

    sinon.assert.notCalled(fs.readFile);
    sinon.assert.calledOnce(spy);
  },


  'yields error from fs.readFile': function () {
    var err = new Error();
    var spy = sinon.spy();
    fs.exists.yields(true);
    fs.readFile.yields(err);

    meta.update([], { file : 'foo' }, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'adds missing entry if publishing': function () {
    setFileContent({ 'existing/item': {} });

    var json = invoke([{ file : { path : 'new/item' } }], true);

    assert(json.meta.hasOwnProperty('new/item'));
  },


  'does not add missing entry if not publishing': function () {
    setFileContent({ 'existing/item': {} });

    var json = invoke([{ file : { path : 'new/item' } }], false);

    assert(!json.meta.hasOwnProperty('new/item'));
  },


  'sets publishg flag to true on json': function () {
    setFileContent({ 'existing/item': {} });
    var json = { file : { path : 'new/item' } };

    invoke([json], true);

    assert(json.publish);
  },


  'sets publish flag to false on json': function () {
    setFileContent({ 'existing/item': {} });
    var json = { file : { path : 'new/item' } };

    invoke([json], false);

    assert.strictEqual(json.publish, false);
  },


  'sets created, modified and rendered timestamp for draft': function () {
    var item = {};
    create(item, false);

    assert.equal(item.file.created, 'DRAFT');
    assert.equal(item.file.modified, 'DRAFT');
    assert.equal(item.file.rendered, 'DRAFT');
  },


  'sets created, modified and rendered timestamp for new published file':
    function () {
      var item = {};
      var json = create(item, true);

      assert.equal(json.created, epocCurrentTZString);
      assert.equal(json.modified, epocCurrentTZString);
      assert.equal(json.rendered, epocCurrentTZString);
      assert.equal(item.file.created, epocCurrentTZString);
      assert.equal(item.file.modified, epocCurrentTZString);
      assert.equal(item.file.rendered, epocCurrentTZString);
    },


  'leaves created but updates modified and rendered for updated file':
    function () {
      var item = {};
      var json = update({
        created  : 'created',
        modified : 'modified',
        rendered : 'rendered'
      }, item);

      assert.equal(json.created, 'created');
      assert.equal(json.modified, epocCurrentTZString);
      assert.equal(json.rendered, epocCurrentTZString);
      assert.equal(item.file.created, 'created');
      assert.equal(item.file.modified, epocCurrentTZString);
      assert.equal(item.file.rendered, epocCurrentTZString);
    },


  'generates empty content sha': function () {
    var json = create({}, true);

    assert.equal(json.content, SHA_EMPTY_CONTENT);
  },


  'generates empty html sha': function () {
    var json = create({}, true);

    assert.equal(json.html, SHA_EMPTY_HTML);
  },


  'updates content sha': function () {
    var json = update({
      content : SHA_EMPTY_CONTENT
    }, {
      some : 'data'
    });

    assert.equal(json.content, SHA_DEFAULT_CONTENT);
  },


  'does not include publish flag in content sha calculation': function () {
    var a = update({ content : SHA_EMPTY_CONTENT }, { some : 'data' }, false);
    var b = update({ content : SHA_EMPTY_CONTENT }, { some : 'data' }, true);

    assert.equal(a.content, b.content);
  },



  'updates html sha': function () {
    var json = update({
      content : SHA_EMPTY_HTML
    }, {
      html : '<html/>'
    });

    assert.equal(json.html, SHA_DEFAULT_HTML);
  },


  'does not update modified or rendered if content did not change':
    function () {
      var json = update({
        modified : 'modified',
        rendered : 'rendered',
        content  : SHA_DEFAULT_CONTENT,
        html     : SHA_EMPTY_HTML
      }, { some : 'data' });

      assert.equal(json.modified, 'modified');
      assert.equal(json.rendered, 'rendered');
    },


  'does not update rendered if html did not change': function () {
    var json = update({
      rendered : 'rendered',
      content  : SHA_EMPTY_CONTENT,
      html     : SHA_DEFAULT_HTML
    }, { html : '<html/>' });

    assert.equal(json.rendered, 'rendered');
  },


  'updates modified and rendered if content changed': function () {
    var json = update({
      modified : 'modified',
      rendered : 'rendered',
      content  : SHA_DEFAULT_CONTENT
    }, { some : 'change' });

    assert.equal(json.modified, epocCurrentTZString);
    assert.equal(json.rendered, epocCurrentTZString);
  },


  'updates rendered only if html changed': function () {
    var json = update({
      modified : 'modified',
      rendered : 'rendered',
      content  : SHA_EMPTY_CONTENT,
      html     : SHA_DEFAULT_HTML
    }, { html : '<change/>' });

    assert.equal(json.modified, 'modified');
    assert.equal(json.rendered, epocCurrentTZString);
  },


  'yields new item as created': function () {
    setFileContent({
      old : {
        content : SHA_EMPTY_CONTENT,
        html    : SHA_EMPTY_HTML
      }
    });
    var item = { file : { path : 'p' }, some : 'data' };

    var result = invoke([item]);

    assert.deepEqual(result.created, [item]);
    assert.deepEqual(result.updated, []);
  },


  'yields item as updated if content changed': function () {
    setFileContent({
      p : {
        content : SHA_DEFAULT_CONTENT,
        html    : SHA_EMPTY_HTML
      }
    });
    var item = { file : { path : 'p' }, some : 'change' };

    var result = invoke([item]);

    assert.deepEqual(result.updated, [item]);
  },


  'yields item as updated if html changed': function () {
    setFileContent({
      p : {
        content : SHA_EMPTY_CONTENT,
        html    : SHA_DEFAULT_HTML
      }
    });
    var item = { file : { path : 'p' }, html : '<change/>' };

    var result = invoke([item]);

    assert.deepEqual(result.updated, [item]);
    assert.equal(result.updated[0].file.path, 'p');
    assert.equal(result.updated[0].html, '<change/>');
  },


  'does not yield item as updated if content did not change': function () {
    setFileContent({
      p : {
        content : SHA_DEFAULT_CONTENT,
        html    : SHA_EMPTY_HTML
      }
    });
    var item = { file : { path : 'p' }, some : 'data' };

    var result = invoke([item]);

    assert.deepEqual(result.updated, []);
  },


  'does not yield item as updated if html did not change': function () {
    setFileContent({
      p : {
        content : SHA_EMPTY_CONTENT,
        html    : SHA_DEFAULT_HTML
      }
    });
    var item = { file : { path : 'p' }, html : '<html/>' };

    var result = invoke([item]);

    assert.deepEqual(result.updated, []);
  },


  'only adds item as changed once if content and html changed': function () {
    setFileContent({
      p : {
        content : SHA_DEFAULT_CONTENT,
        html    : SHA_DEFAULT_HTML
      }
    });
    var item = { file : { path : 'p' }, some : 'change', html : '<change/>' };

    var result = invoke([item]);

    assert.deepEqual(result.updated, [item]);
  },


  'checks whether file exists in target': function () {
    setFileContent({
      p : {
        content : SHA_DEFAULT_CONTENT,
        html    : SHA_DEFAULT_HTML
      }
    });
    var item = { file : { path : 'p' }, some : 'data', html : '<html/>' };

    invoke([item]);

    sinon.assert.calledOnce(fs.existsSync);
    sinon.assert.calledWith(fs.existsSync, 'some/target/p');
  },


  'adds item as missing if file does not exist in target': function () {
    setFileContent({
      p : {
        content : SHA_DEFAULT_CONTENT,
        html    : SHA_DEFAULT_HTML
      }
    });
    fs.existsSync.returns(false);
    var item = { file : { path : 'p' }, some : 'data', html : '<html/>' };

    var result = invoke([item]);

    assert.deepEqual(result.missing, [item]);
  },


  'does not add item as missing if file exists in target': function () {
    setFileContent({
      p : {
        content : SHA_DEFAULT_CONTENT,
        html    : SHA_DEFAULT_HTML
      }
    });
    fs.existsSync.returns(true);
    var item = { file : { path : 'p' }, some : 'data', html : '<html/>' };

    var result = invoke([item]);

    assert.deepEqual(result.missing, []);
  },


  'yields item path as deleted if it was in file but not in items':
    function () {
      setFileContent({
        'some/path' : {
          content   : SHA_DEFAULT_CONTENT,
          html      : SHA_DEFAULT_HTML
        }
      });

      var result = invoke([]);

      assert.deepEqual(result.deleted, ['some/path']);
    },


  'remove item from meta if it was in file but not in items': function () {
    setFileContent({
      'some/path' : {
        content   : SHA_DEFAULT_CONTENT,
        html      : SHA_DEFAULT_HTML
      }
    });

    var result = invoke([]);

    assert(!result.meta.hasOwnProperty('some/path'));
  }

});


test('meta persist', {

  before: function () {
    sinon.stub(fs, 'writeFile');
  },

  after: function () {
    fs.writeFile.restore();
  },


  'writes file with formatted content': function () {
    var content = {
      any       : {
        content : 'to persist'
      }
    };
    meta.persist(content, {}, function () {});

    sinon.assert.calledOnce(fs.writeFile);
    sinon.assert.calledWith(fs.writeFile, 'blogdown.meta',
      JSON.stringify(content, true, '  '));
  },


  'writes file to configured path': function () {
    meta.persist({}, { file : 'other.meta' }, function () {});

    sinon.assert.calledWith(fs.writeFile, 'other.meta');
  },


  'yields error from writeFile': function () {
    var spy = sinon.spy();
    var err = new Error();
    fs.writeFile.yields(err);

    meta.persist({}, {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, err);
  },


  'yields null from writeFile': function () {
    fs.writeFile.yields(null);
    var spy = sinon.spy();

    meta.persist({}, {}, spy);

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, null);
  }

});

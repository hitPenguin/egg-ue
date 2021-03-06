'use strict';

const { app, assert/* , mock*/ } = require('egg-mock/bootstrap');
const lodash = require('lodash');
const uuid = require('uuid');
const { join } = require('path');

describe('test/extend/helper.test.js', () => {
  describe('xor', () => {
    it('xor 1', () => {
      const ctx = app.mockContext();
      const xor = ctx.helper.xor;
      const result = xor([ 2, 1, 3 ], [ 2, 4, 6, 1 ]);
      assert.deepEqual(result.toDel, [ 3 ]);
      assert.deepEqual(result.toAdd, [ 4, 6 ]);
    });
    it('xor 2', () => {
      const ctx = app.mockContext();
      const xor = ctx.helper.xor;
      const result = xor([], [ 2, 4, 1 ]);
      assert.deepEqual(result.toAdd, [ 2, 4, 1 ]);
      assert(result.toDel.length === 0);
    });
    it('xor 3', () => {
      const ctx = app.mockContext();
      const xor = ctx.helper.xor;
      const result = xor([ 2, 1, 3 ], []);
      assert.deepEqual(result.toDel, [ 2, 1, 3 ]);
      assert(result.toAdd.length === 0);
    });

    it('xor string', () => {
      const ctx = app.mockContext();
      const xor = ctx.helper.xor;
      const result = xor([ 'bang', 'leo', 'yao', 'long' ], [ 'leo', 'bang', 'deng', 'yang' ]);
      assert.deepEqual(result.toDel, [ 'yao', 'long' ]);
      assert.deepEqual(result.toAdd, [ 'deng', 'yang' ]);
    });
  });

  describe('uuid && lodash', () => {
    it('should true', () => {
      const ctx = app.mockContext();
      assert(ctx.helper.uuid === uuid);
      assert(ctx.helper._ === lodash);
    });
  });

  describe('password', () => {
    it('hash & compare', async () => {
      const ctx = app.mockContext();
      const originalPassword = '1234';
      const hashPassword = await ctx.helper.password.hash(originalPassword);
      assert(originalPassword !== hashPassword);
      assert(await ctx.helper.password.compare(originalPassword, hashPassword));
      assert(!(await ctx.helper.password.compare(originalPassword, hashPassword + '123')));
    });
  });

  describe('exec', () => {
    it('exec ls', async () => {
      const ctx = app.mockContext();
      const resAsync = await ctx.helper.exec(`ls ${__dirname}`);
      assert(resAsync.stderr === '');
      assert(resAsync.stdout === 'application.test.js\ncontext.test.js\nhelper.test.js\ntest_file\n');
    });
  });

  describe('pagination', () => {
    it('default args', () => {
      const ctx = app.mockContext();
      const res = ctx.helper.pagination();
      assert(res.prev === null);
      assert(res.data.length === 0);
    });
    it('count < limit', () => {
      const ctx = app.mockContext();
      const data = [ 1, 2, 3, 4, 5, 6 ];
      const res = ctx.helper.pagination(data, 1, 10);
      assert(res.data.length === data.length);
      assert(res.prev === null);
      assert(res.count === data.length);
    });
  });

  describe('fs', () => {
    it('readFileAsync', async () => {
      const ctx = app.mockContext();
      const content = await ctx.helper.fs.readFileAsync(join(__dirname, 'test_file'), 'utf8');
      assert(content === 'hello.');
    });
    it('writeFileAsync', async () => {
      const ctx = app.mockContext();
      const fs = ctx.helper.fs;
      const readStream = fs.createReadStream(join(__dirname, 'test_file'), 'utf8');
      const writeStream = fs.createWriteStream(join(__dirname, 'test_file_copy'), 'utf8');
      readStream.pipe(writeStream);
      await fs.accessAsync(join(__dirname, 'test_file_copy'), fs.constants.W_OK | fs.constants.R_OK); //eslint-disable-line
      await fs.unlinkAsync(join(__dirname, 'test_file_copy'));
      try {
        await fs.accessAsync(join(__dirname, 'test_file_copy'));
      } catch (e) {
        assert(e.code === 'ENOENT');
      }
    });
  });
});

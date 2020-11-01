const test = require('../');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

test('basic test that passes', t => {
  t.plan(3);

  t.equal(1, 1);
  t.equal(1, 1);
  t.equal(1, 1);
});

test('basic test that passes with comment', t => {
  t.plan(1);

  t.equal(1, 1, 'i have a custom comment');
});

test('basic test that fails', t => {
  t.plan(1);

  t.equal(1, 2);
});

test('promise 1 - basic test that passes', async t => {
  t.plan(1);

  await sleep(200);

  t.equal(1, 1);
});

test('promise 2 - basic test that passes', async t => {
  t.plan(1);

  await sleep(200);

  t.equal(1, 1);
});

# basictap
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/markwylde/basictap)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/markwylde/basictap)](https://github.com/markwylde/basictap/blob/master/package.json)
[![GitHub](https://img.shields.io/github/license/markwylde/basictap)](https://github.com/markwylde/basictap/blob/master/LICENSE)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/standard/semistandard)

Light tap adherent test runner.

- Asyncronous tests run in parallel
- Outputs tap syntax
- Uses built in node `assert` library

## Installation
```bash
npm install --save basictap
```

## Example
```javascript
const test = require('basictap');

test('basic test that passes', t => {
  t.plan(1);

  t.equal(1, 1);
});

test('basic test that passes with async', async t => {
  t.plan(1);

  const something = await doSomething();

  t.equal(something, 1);
});
```

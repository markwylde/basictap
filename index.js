const tape = require('tape');
const runner = require('./runner');

const tests = {};
module.exports = function (name, job) {
  tests[name] = job;
};

process.nextTick(() => {
  if (process.argv[2] === 'tape') {
    Object.keys(tests).forEach(key => {
      tape(key, tests[key]);
    });
  } else {
    runner(tests);
  }
});

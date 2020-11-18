const tape = require('tape');
const runner = require('./runner');

const tests = {};
const only = [];
const skip = [];

function createTest (name, job) {
  tests[name] = job;
}
createTest.skip = function (name, job) {
  tests[name] = job;
  skip.push(name);
};
createTest.only = function (name, job) {
  tests[name] = job;
  only.push(name);
};

module.exports = createTest;

process.nextTick(() => {
  if (process.argv[2] === 'tape') {
    Object.keys(tests).forEach(key => {
      tape(key, tests[key]);
    });
  } else {
    const enabledTests = [];
    Object.keys(tests)
      .forEach(key => {
        if (only.length > 0 && !only.includes(key)) {
          return false;
        }
        if (skip.includes(key)) {
          return false;
        }

        enabledTests.push(tests[key]);
      });

    runner(enabledTests, () => {
      console.log('# skipped', skip.length);
      only.length && console.log('# only', only.length);
    });
  }
});

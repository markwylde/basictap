const tape = require('tape');
const chalk = require('chalk');

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
    const enabledTests = {};
    Object.keys(tests)
      .forEach(key => {
        if (only.length > 0 && !only.includes(key)) {
          return false;
        }
        if (skip.includes(key)) {
          return false;
        }

        enabledTests[key] = tests[key];
      });

    runner(enabledTests, (_, { totalFailed }) => {
      console.log('# skip  ' + skip.length);
      only.length && console.log('# only  ' + only.length);

      if (only.length > 0 || skip.length > 0) {
        console.log(chalk.yellowBright('\n** you are not running all your tests **'));
      }

      if (totalFailed > 0) {
        console.log(chalk.redBright(`\n${totalFailed} tests failed`));
        process.exit(1);
      } else {
        process.exit(0);
      }
    });
  }
});

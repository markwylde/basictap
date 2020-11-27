const colorette = require('colorette');

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

createTest.maximumConcurrentTests = 5;

module.exports = createTest;

process.nextTick(() => {
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

  runner(enabledTests, { maximumConcurrentTests: createTest.maximumConcurrentTests }, (_, { totalAssertionsFailed }) => {
    console.log('# skip  ' + skip.length);
    only.length && console.log('# only  ' + only.length);

    if (only.length > 0 || skip.length > 0) {
      console.log(colorette.yellowBright('\n** you are not running all your tests **'));
    }

    if (totalAssertionsFailed > 0) {
      console.log(colorette.redBright(`\n${totalAssertionsFailed} tests failed`));
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
});

const runner = require('./runner');

const tests = {};
module.exports = function (name, job) {
  tests[name] = job;
};

process.nextTick(() => {
  runner(tests);
});

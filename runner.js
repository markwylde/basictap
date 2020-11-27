const assert = require('assert');
const { inspect } = require('util');

const concurrencyLimit = require('concurrun');
const righto = require('righto');

function indent (spaces, text) {
  return text.split('\n').map(line => {
    return Array(spaces).fill('').join(' ') + line;
  }).join('\n');
}

function createLogger () {
  let logData = '';
  function log (what) {
    logData = logData + what + '\n';
  }

  return {
    log,
    getLogData: () => logData
  };
}

function runner (tests, callback) {
  console.log('TAP version 13');

  const scope = {
    testsToRun: Object.keys(tests).length,

    totalAssertions: 0,
    totalAssertionsPassed: 0,
    totalAssertionsFailed: 0,
    testsStarted: 0,
    testsFinished: 0,
    testsPassed: 0,
    testsFailed: 0
  };

  function testRunner (testName, done) {
    scope.testsStarted = scope.testsStarted + 1;

    let currentFails = 0;
    let currentPasses = 0;
    let currentAsserted = 0;
    let currentAssertionsPlanned = 0;

    const job = tests[testName];

    const { log, getLogData } = createLogger();
    log(`# ${testName}`);

    function createAssert (finish, name, argumentCount, defaultComment) {
      return (...args) => {
        scope.totalAssertions = scope.totalAssertions + 1;
        currentAsserted = currentAsserted + 1;
        try {
          if (name) {
            if (typeof name === 'function') {
              name(...args);
            } else {
              assert.strict[name](...args);
            }
          }
          currentPasses = currentPasses + 1;
          scope.totalAssertionsPassed = scope.totalAssertionsPassed + 1;
          log(`ok ${scope.totalAssertions} ${args[argumentCount] || defaultComment}`);
        } catch (error) {
          currentFails = currentFails + 1;
          scope.totalAssertionsFailed = scope.totalAssertionsFailed + 1;
          log(`not ok ${scope.totalAssertions} ${args[argumentCount] || defaultComment}`);
          log(indent(3, '---'));
          log(indent(5, 'operator: ' + name));
          log(indent(5, 'expected: ' + inspect(args[1], { breakLength: Infinity })));
          log(indent(5, 'actual:   ' + inspect(args[0], { breakLength: Infinity })));
          log(indent(5, 'message:  ' + inspect(error.message, { breakLength: Infinity })));
          log(indent(5, 'stack: |-'));
          log(indent(8, error.stack));
          log(indent(3, '...'));
        }
        finish();
      };
    }

    function finish () {
      if (currentAsserted < currentAssertionsPlanned) {
        return;
      }

      scope.testsFinished = scope.testsFinished + 1;

      if (currentAsserted > currentAssertionsPlanned) {
        scope.totalAssertions = scope.totalAssertions + 1;
        currentAsserted = currentAsserted + 1;
        currentFails = currentFails + 1;
        scope.totalAssertionsFailed = scope.totalAssertionsFailed + 1;
        log(`not ok ${scope.totalAssertions} - expected planned assertions to be ${currentAssertionsPlanned} but got ${currentAsserted}`);
        return;
      }

      done();

      process.stdout.write(getLogData());
      if (currentFails > 0) {
        scope.testsFailed = scope.testsFailed + 1;
      } else {
        scope.testsPassed = scope.testsPassed + 1;
      }
    }

    job({
      plan: (count) => {
        currentAssertionsPlanned = count;
      },

      pass: createAssert(finish, null, 0, 'passed'),
      fail: createAssert(finish, 'fail', 0, 'failed'),
      ok: createAssert(finish, 'ok', 0, 'ok'),
      notOk: createAssert(finish, (actual) => assert.strict.equal(!!actual, false), 0, 'notOk'),
      equal: createAssert(finish, 'equal', 2, 'should equal'),
      notEqual: createAssert(finish, 'notEqual', 2, 'should notEqual'),
      deepEqual: createAssert(finish, 'deepEqual', 2, 'should deepEqual'),
      notDeepEqual: createAssert(finish, 'notDeepEqual', 2, 'should notDeepEqual'),
      deepStrictEqual: createAssert(finish, 'deepStrictEqual', 2, 'should deepStrictEqual'),
      notDeepStrictEqual: createAssert(finish, 'notDeepStrictEqual', 2, 'should notDeepStrictEqual'),
      strictEqual: createAssert(finish, 'strictEqual', 2, 'should strictEqual'),
      notStrictEqual: createAssert(finish, 'notStrictEqual', 2, 'should notStrictEqual'),
      throws: createAssert(finish, 'throws', 2, 'should throws'),
      rejects: createAssert(finish, 'rejects', 2, 'should rejects'),
      doesNotThrow: createAssert(finish, 'doesNotThrow', 2, 'should doesNotThrow'),
      doesNotReject: createAssert(finish, 'doesNotReject', 2, 'should doesNotReject'),
      match: createAssert(finish, 'match', 2, 'should match'),
      doesNotMatch: createAssert(finish, 'doesNotMatch', 2, 'should doesNotMatch')
    });
  }

  const limitedRunner = concurrencyLimit(5);
  const limitedTestRunner = limitedRunner(testRunner);
  const finished = righto.all(Object.keys(tests).map(testName =>
    righto(limitedTestRunner, testName)
  ));

  finished(() => {
    console.log('');
    console.log('1..3');
    console.log(`# tests ${scope.totalAssertions}`);
    console.log(`# pass  ${scope.totalAssertionsPassed}`);
    console.log(`# fail  ${scope.totalAssertionsFailed}`);

    callback && callback(null, scope);
  })
}

module.exports = runner;

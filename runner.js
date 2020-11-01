const assert = require('assert');

function indent (spaces, text) {
  return text.split('\n').map(line => {
    return Array(spaces).fill('').join(' ') + line;
  }).join('\n');
}

function runner (tests) {
  console.log('TAP version 13');

  let totalAssertions = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let testsPassed = 0;
  let testsFailed = 0;
  let testsTotal = 0;

  const results = Object.keys(tests)
    .map(testName => {
      testsTotal = testsTotal + 1;

      let fails = 0;
      let passes = 0;
      let asserted = 0;
      let assertionsPlanned = 0;

      // Logger
      const job = tests[testName];
      let logData = '';
      function log (what) {
        logData = logData + what + '\n';
      }
      log(`# ${testName}`);

      function createAssert (name, argumentCount, defaultComment) {
        return (...args) => {
          totalAssertions = totalAssertions + 1;
          asserted = asserted + 1;
          try {
            assert.strict[name](...args);
            passes = passes + 1;
            totalPassed = totalPassed + 1;
            log(`ok ${totalAssertions} ${args[argumentCount] || defaultComment}`);
          } catch (error) {
            fails = fails + 1;
            totalFailed = totalFailed + 1;
            log(`not ok ${totalAssertions} ${args[argumentCount] || defaultComment}`);
            log(indent(4, '---\n' + error.stack));
          }
        };
      }

      const result = job({
        plan: (count) => {
          assertionsPlanned = count;
        },

        fail: createAssert('fail', 0, 'failed'),

        equal: createAssert('equal', 2, 'should equal'),
        notEqual: createAssert('notEqual', 2, 'should notEqual'),
        deepEqual: createAssert('deepEqual', 2, 'should deepEqual'),
        notDeepEqual: createAssert('notDeepEqual', 2, 'should notDeepEqual'),
        deepStrictEqual: createAssert('deepStrictEqual', 2, 'should deepStrictEqual'),
        notDeepStrictEqual: createAssert('notDeepStrictEqual', 2, 'should notDeepStrictEqual'),
        strictEqual: createAssert('strictEqual', 2, 'should strictEqual'),
        notStrictEqual: createAssert('notStrictEqual', 2, 'should notStrictEqual'),
        throws: createAssert('throws', 2, 'should throws'),
        rejects: createAssert('rejects', 2, 'should rejects'),
        doesNotThrow: createAssert('doesNotThrow', 2, 'should doesNotThrow'),
        doesNotReject: createAssert('doesNotReject', 2, 'should doesNotReject'),
        match: createAssert('match', 2, 'should match'),
        doesNotMatch: createAssert('doesNotMatch', 2, 'should doesNotMatch')
      });

      function finish () {
        if (assertionsPlanned !== asserted) {
          totalAssertions = totalAssertions + 1;
          asserted = asserted + 1;
          fails = fails + 1;
          totalFailed = totalFailed + 1;
          log(`not ok ${totalAssertions} - planned assertions differed from actual assertion count`);
        }

        process.stdout.write(logData);
        if (fails > 0) {
          testsFailed = testsFailed + 1;
        } else {
          testsPassed = testsPassed + 1;
        }
      }

      if (result && result.then) {
        result.then(finish);
      } else {
        finish();
      }

      return result;
    });

  Promise.all(results)
    .then(() => {
      console.log('');
      console.log('1..3');
      console.log(`# tests ${totalAssertions}`);
      console.log(`# pass  ${totalPassed}`);
      console.log(`# fail  ${totalFailed}`);

      if (totalFailed > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    });
}

module.exports = runner;

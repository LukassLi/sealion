// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { DebugSettings } from '../service/DebugSettings';
import { QiaosuanRunner } from '../service/QiaosuanRunner';
import { TestData } from '../service/TestData';

const count = {
    skip: 0,
    pass: 0,
    fail: 0,
    perfect: 0,
};

function verifyScript(expect, actual): string {
    if (actual === undefined) {
        return undefined;
    }
    if (expect.input !== actual.inputExpression) {
        return `mismatch input. actual=${actual.inputExpression}, expect=${expect.input}`;
    }
    if (expect.firstExpression !== actual.firstExpression) {
        return `mismatch firstExpression. actual=${actual.firstExpression}, expect=${
            expect.firstExpression
        }`;
    }
    if (
        expect.finalExpression != expect.firstExpression &&
        expect.finalExpression !== actual.finalExpression
    ) {
        return `mismatch finalExpression. actual=${actual.finalExpression}, expect=${
            expect.finalExpression
        }`;
    }
    return 'perfect';
}

const tests = TestData.allCases; // .slice(0, 50);

for (const test of tests) {
    if (test.id.lastIndexOf('-') === test.id.length - 1) {
        // test.id.endsWith('-')
        // console.log('SKIP', test.input, test.id);
        ++count.skip;
        continue;
    }

    if (test.id.lastIndexOf('+') === test.id.length - 1) {
        // test.id.endsWith('+')
        console.log('SKIP', test.input, test.id);
        ++count.skip;
        continue;
    }

    const runner = new QiaosuanRunner(test.input);
    const result = runner.run();
    // console.log(result);
    const first =
        result === undefined || result.pattern === undefined
            ? undefined
            : result.pattern.firstExpression;
    const final =
        result === undefined || result.pattern === undefined
            ? undefined
            : result.pattern.finalExpression;
    const expectFirst = test.firstExpression;
    const expectFinal = test.finalExpression;

    const pass =
        (first === expectFirst && final === expectFinal) ||
        (first === expectFirst && '' === expectFinal);

    let scriptCheckResult = verifyScript(test, result);

    if (scriptCheckResult === 'perfect') {
        ++count.perfect;
    } else if (scriptCheckResult !== undefined) {
        scriptCheckResult = scriptCheckResult; // .substring(0, scriptCheckResult.indexOf(". "));
    }

    if (pass) {
        ++count.pass;
        console.log(
            'PASS',
            test.input,
            'first=' + first + ' vs expect=' + expectFirst,
            'final=' + final + ' vs expect=' + expectFinal,
            result === undefined || result.pattern === undefined ? undefined : result.pattern.name,
            scriptCheckResult
        );
    } else {
        ++count.fail;
        console.info(
            'FAIL',
            test.input,
            'first=' + first + ' vs expect=' + expectFirst,
            'final=' + final + ' vs expect=' + expectFinal,
            result === undefined || result.pattern === undefined ? undefined : result.pattern.name,
            scriptCheckResult
        );
        // break;
    }
}

console.log(
    '\n\nTOTAL  =',
    tests.length,
    '\nSKIP   =',
    count.skip,
    Math.floor((count.skip * 100) / tests.length) + '%',
    '\nPASS   =',
    count.pass,
    Math.floor((count.pass * 100) / tests.length) + '%',
    '\nPERFECT=',
    count.perfect,
    Math.floor((count.perfect * 100) / count.pass) + '%',
    '\nFAIL   =',
    count.fail,
    Math.floor((count.fail * 100) / tests.length) + '%'
);

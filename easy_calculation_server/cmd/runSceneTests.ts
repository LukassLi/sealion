// Copyright (C) 2019, Flickering Inc. All rights reserved.
// Author: Kun Huang (huangkun1988@gmail.com)

import { QiaosuanRunner } from '../service/QiaosuanRunner';
import * as fs from 'fs';

console.log = (..._: any[]) => {};

const TEST_HOME = '../tests/';
const TEST_LOG_DIR = 'testlogs/';
const files = fs.readdirSync(TEST_HOME);

for (const file of files) {
  console.log(file);
  const content = fs.readFileSync(TEST_HOME + file, 'UTF8');
  console.log(content);
  const data = JSON.parse(content);
  const input = data.input as string;

  console.info('Test on ', input);

  const runner = new QiaosuanRunner(input);
  const result = runner.run();
  const output = { input, scenes: result.scenes };

  const expectedJson = JSON.stringify(data.scenes, null, 2);
  const actualJson = JSON.stringify(output.scenes, null, 2);

  const expected = expectedJson.split('\n');
  const actual = actualJson.split('\n');

  fs.writeFileSync(`../${TEST_LOG_DIR}${file}.expected`, expectedJson, { flag: 'w', encoding: 'UTF8' });
  fs.writeFileSync(`../${TEST_LOG_DIR}${file}.actual`, actualJson, { flag: 'w', encoding: 'UTF8' });

  let passed: boolean;
  for (let i = 0; i < expected.length; ++i) {
    if (i >= actual.length || actual[i] !== expected[i]) {
      console.error(
        `... Failed on line ${i}, diff command \n\tnpm run diff -- ${TEST_LOG_DIR}${file}.actual ${TEST_LOG_DIR}${file}.expected`
      );
      console.error('   > actual = ', actual[i]);
      console.error('   < expect = ', expected[i]);
      passed = false;
      break;
    }
  }
  if (passed === true) {
    console.info('... Passed');
  }
}

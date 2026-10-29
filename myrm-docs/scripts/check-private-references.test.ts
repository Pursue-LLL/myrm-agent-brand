import { afterAll, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { findPrivateReferences } from './check-private-references';

const DIR = 'temp-' + 'docs';
const MATERIALS = 'MEMORY_ADVANT' + 'AGE.md';
const ID = 'topic' + '_12';

const workdir = mkdtempSync(join(tmpdir(), 'private-refs-'));
afterAll(() => rmSync(workdir, { recursive: true, force: true }));

function matches(line: string): boolean {
  writeFileSync(join(workdir, 'sample.txt'), `${line}\n`);
  return findPrivateReferences(workdir, ['--no-index', '--', 'sample.txt']).length > 0;
}

describe('check-private-references', () => {
  test.each([
    [`see ${DIR}/roadmap/a.md`, true],
    [`prose names ${DIR.toUpperCase()} only`, true],
    [`see internal ${MATERIALS}`, true],
    [`${ID} is planned`, true],
    [`ends with ${ID}`, true],
    [`planned in (${ID})`, true],
    [`条目${ID}已完成`, true],
    [`chat key _${ID}`, false],
    [`my${ID}`, false],
    [`${ID}3`, false],
    ['CLOUD_ADVANTAGE_KEYS', false],
  ])('%s -> %p', (line, expected) => {
    expect(matches(line)).toBe(expected);
  });

  test('tracked files of the brand repo carry no private references', () => {
    expect(findPrivateReferences()).toEqual([]);
  });
});

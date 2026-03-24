import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('includes newly added service categories', () => {
  const source = fs.readFileSync(new URL('./types.ts', import.meta.url), 'utf8');
  assert.match(source, /"Social Media \/ Marketing"/);
  assert.match(source, /"AI, Agents and Automation"/);
  assert.match(source, /"Online \/ Digital Services"/);
});

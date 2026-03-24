import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLocationArea, DEFAULT_LOCATION_AREA } from './request-location.js';

test('returns explicit location when provided', () => {
  assert.equal(normalizeLocationArea('Downtown Montreal'), 'Downtown Montreal');
});

test('defaults blank location to Remote / Online only', () => {
  assert.equal(normalizeLocationArea(''), DEFAULT_LOCATION_AREA);
  assert.equal(normalizeLocationArea('   '), DEFAULT_LOCATION_AREA);
  assert.equal(DEFAULT_LOCATION_AREA, 'Remote / Online only');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { TABLES } from './db-tables.js';

test('QuoteVeil app maps to existing getaquote database tables', () => {
  assert.equal(TABLES.requests, 'getaquote_requests');
  assert.equal(TABLES.quotes, 'getaquote_quotes');
  assert.equal(TABLES.vendors, 'getaquote_vendors');
  assert.equal(TABLES.users, 'getaquote_users');
  assert.equal(TABLES.matches, 'getaquote_matches');
});

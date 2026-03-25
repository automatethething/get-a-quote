import test from 'node:test';
import assert from 'node:assert/strict';
import { TABLES } from './db-tables.js';

test('QuoteVeil app maps to existing quoteveil database tables', () => {
  assert.equal(TABLES.requests, 'quoteveil_requests');
  assert.equal(TABLES.quotes, 'quoteveil_quotes');
  assert.equal(TABLES.vendors, 'quoteveil_vendors');
  assert.equal(TABLES.users, 'quoteveil_users');
  assert.equal(TABLES.matches, 'quoteveil_matches');
});

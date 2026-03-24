import test from 'node:test';
import assert from 'node:assert/strict';
import {
  availableOpenCategories,
  buildRequestShareText,
  truncateDescription,
} from './request-discovery.js';

test('availableOpenCategories returns only categories present in open requests', () => {
  const categories = availableOpenCategories([
    { category: 'Web Design / Dev' },
    { category: 'Photography' },
    { category: 'Web Design / Dev' },
  ]);

  assert.deepEqual(categories, ['Photography', 'Web Design / Dev']);
});

test('buildRequestShareText leads with title and includes location plus CTA', () => {
  const text = buildRequestShareText({
    title: 'Need landing page copy for SaaS launch',
    category: 'Writing / Copywriting',
    location_area: 'Remote / Online only',
  });

  assert.match(text, /Need landing page copy for SaaS launch/);
  assert.match(text, /Writing \/ Copywriting/);
  assert.match(text, /Remote \/ Online only/);
  assert.match(text, /Bid on this project in less than 3 minutes/);
});

test('truncateDescription keeps short descriptions intact and trims long ones', () => {
  assert.equal(truncateDescription('Short description', 50), 'Short description');
  assert.equal(truncateDescription('A'.repeat(80), 20), `${'A'.repeat(19)}…`);
});

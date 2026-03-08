import assert from 'node:assert/strict';
import test from 'node:test';
import { formatPrice } from './price';

test('formatPrice formats free cost type', () => {
  assert.equal(formatPrice('FREE', 0), '무료');
});

test('formatPrice formats beverage cost type', () => {
  assert.equal(formatPrice('BEVERAGE', 2), '음료수 2병');
});

test('formatPrice formats money cost type', () => {
  assert.equal(formatPrice('MONEY', 15000), '15,000원');
});

test('formatPrice falls back to free when cost type is missing and amount is 0', () => {
  assert.equal(formatPrice(undefined, 0), '무료');
});

test('formatPrice falls back to money when cost type is missing and amount is positive', () => {
  assert.equal(formatPrice(undefined, 5000), '5,000원');
});

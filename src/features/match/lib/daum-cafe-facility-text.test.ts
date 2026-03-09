import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDaumCafeFacilityText,
  buildDaumCafeParkingText,
} from './daum-cafe-facility-text';

test('buildDaumCafeParkingText includes parking fee and location when both exist', () => {
  const text = buildDaumCafeParkingText({
    parking: true,
    parking_fee: '2,000원',
    parking_location: '지하 1층 주차장',
  });

  assert.equal(text, '주차: 유료 (2,000원) / 주차 위치: 지하 1층 주차장');
});

test('buildDaumCafeParkingText marks free parking when fee is free/empty', () => {
  const text = buildDaumCafeParkingText({
    parking: true,
    parking_fee: '무료',
    parking_location: '체육관 옆 공영주차장',
  });

  assert.equal(text, '주차: 무료 / 주차 위치: 체육관 옆 공영주차장');
});

test('buildDaumCafeParkingText supports impossible parking', () => {
  const text = buildDaumCafeParkingText({
    parking: false,
  });

  assert.equal(text, '주차: 불가');
});

test('buildDaumCafeFacilityText composes facility information with parking details', () => {
  const text = buildDaumCafeFacilityText({
    facilities: {
      court_size_type: 'REGULAR',
      parking: true,
      parking_fee: '3,000원',
      parking_location: '건물 뒤편 유료 주차장',
      shower: true,
    },
    providesBeverage: true,
  });

  assert.equal(
    text,
    '정규 사이즈, 주차: 유료 (3,000원) / 주차 위치: 건물 뒤편 유료 주차장, 온수샤워 가능, 물/음료 제공'
  );
});


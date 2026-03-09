import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDaumCafeRecruitTitle } from './daum-cafe-title';

test('buildDaumCafeRecruitTitle generates title in requested format', () => {
  const title = buildDaumCafeRecruitTitle({
    dateISO: '2026-03-08',
    startTime: '17:00',
    endTime: '19:00',
    placeName: '광문고등학교',
    address: '서울 강동구 천호대로 260',
  });

  assert.equal(
    title,
    '[서울][강동구] 3월8일 일요일 17시~19시 광문고등학교에서 게스트 모집합니다.'
  );
});

test('buildDaumCafeRecruitTitle normalizes city names like 서울특별시', () => {
  const title = buildDaumCafeRecruitTitle({
    dateISO: '2026-03-09',
    startTime: '20:00',
    endTime: '22:00',
    placeName: '강남스포츠문화센터',
    address: '서울특별시 강남구 수서동 718번지',
  });

  assert.equal(
    title,
    '[서울][강남구] 3월9일 월요일 20시~22시 강남스포츠문화센터에서 게스트 모집합니다.'
  );
});

test('buildDaumCafeRecruitTitle supports minute precision when needed', () => {
  const title = buildDaumCafeRecruitTitle({
    dateISO: '2026-03-10',
    startTime: '18:30',
    endTime: '20:15',
    placeName: '잠실보조체육관',
    address: '서울 송파구 올림픽로 25',
  });

  assert.equal(
    title,
    '[서울][송파구] 3월10일 화요일 18시30분~20시15분 잠실보조체육관에서 게스트 모집합니다.'
  );
});

test('buildDaumCafeRecruitTitle falls back when region parsing is not possible', () => {
  const title = buildDaumCafeRecruitTitle({
    dateISO: '2026-03-11',
    startTime: '06:00',
    endTime: '08:00',
    placeName: '체육관',
    address: '',
  });

  assert.equal(
    title,
    '[지역미정][장소미정] 3월11일 수요일 6시~8시 체육관에서 게스트 모집합니다.'
  );
});

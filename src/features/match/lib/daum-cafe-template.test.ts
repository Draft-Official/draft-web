import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDaumCafeRecruitBody,
  buildDaumCafeRecruitTemplate,
} from './daum-cafe-template';

const sampleInput = {
  dateISO: '2026-03-09',
  startTime: '20:00',
  endTime: '22:00',
  placeName: '강남스포츠문화센터',
  address: '서울특별시 강남구 수서동 718번지',
  teamName: '하비스',
  recruitmentText: '총 4명 (가드 2명 / 포워드 1명 / 센터 1명)',
  costText: '만원 입금순으로 마감합니다',
  contactText: '공1공 육83팔 242육',
  notesText: '정규코트 무료 주차장 온수샤워 난방 가능합니다',
  shareUrl: 'https://draft.kr/m/abc123',
};

test('buildDaumCafeRecruitBody creates numbered body sections and short link', () => {
  const body = buildDaumCafeRecruitBody(sampleInput);

  assert.match(body, /1\. HOME 팀명 : 하비스/u);
  assert.match(body, /2\. 일시 : 3월 9일 월요일 20시 ~ 22시/u);
  assert.match(body, /3\. 장소 : 강남스포츠문화센터 \(서울특별시 강남구 수서동 718번지\)/u);
  assert.match(body, /4\. 게스트 모집 인원 : 총 4명/u);
  assert.match(body, /8\. 기타 참고 사항:\n     정규코트 무료 주차장 온수샤워 난방 가능합니다/u);
  assert.match(body, /7\. 게스트 신청 시 필수 정보 : \(이름\/나이\/키\/포지션 등\)/u);
  assert.match(body, /짧은 링크 : https:\/\/draft\.kr\/m\/abc123/u);
});

test('buildDaumCafeRecruitBody supports multi-line notes format', () => {
  const body = buildDaumCafeRecruitBody({
    ...sampleInput,
    notesText: '공지 사항 : 실내화 필수\n시설 정보 : 무료주차, 온수샤워',
  });

  assert.match(body, /8\. 기타 참고 사항:\n     공지 사항 : 실내화 필수\n     시설 정보 : 무료주차, 온수샤워/u);
});

test('buildDaumCafeRecruitTemplate returns title, body, and combined text', () => {
  const result = buildDaumCafeRecruitTemplate(sampleInput);

  assert.equal(
    result.title,
    '[서울][강남구] 3월9일 월요일 20시~22시 하비스에서 게스트 모집합니다.'
  );
  assert.equal(result.fullText, `${result.title}\n\n${result.body}`);
});

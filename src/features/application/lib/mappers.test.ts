import assert from 'node:assert/strict';
import test from 'node:test';
import type { SessionProfile } from '@/shared/session';
import type { ApplyFormDTO } from '../model/types';
import { buildCreateApplicationDTO, buildProfileUpdateFromApplyForm } from './mappers';

function createProfile(overrides?: Partial<SessionProfile>): SessionProfile {
  return {
    id: 'user-1',
    email: 'user@test.com',
    nickname: '닉네임',
    real_name: '홍길동',
    avatar_url: null,
    phone: null,
    phone_verified: true,
    positions: null,
    metadata: {},
    account_info: null,
    operation_info: null,
    manner_score: null,
    created_at: null,
    deleted_at: null,
    ...overrides,
  };
}

test('buildCreateApplicationDTO includes main participant height/age/skillLevel', () => {
  const profile = createProfile();
  const formData = {
    height: '182',
    age: '29',
    skillLevel: '4',
    position: 'G',
    teamId: '',
  } as ApplyFormDTO;

  const dto = buildCreateApplicationDTO({
    matchId: 'match-1',
    userId: 'user-1',
    formData,
    companions: [],
    hasCompanions: false,
    profile,
  });

  assert.equal(dto.participants.length, 1);
  assert.deepEqual(dto.participants[0], {
    type: 'MAIN',
    name: '닉네임',
    position: 'G',
    height: 182,
    age: 29,
    skillLevel: 4,
  });
});

test('buildProfileUpdateFromApplyForm saves missing skill_level metadata', () => {
  const profile = createProfile({
    metadata: {
      height: 180,
      age: 28,
    },
  });

  const formData = {
    height: '180',
    age: '28',
    skillLevel: '5',
    position: 'F',
    teamId: '',
  } as ApplyFormDTO;

  const updates = buildProfileUpdateFromApplyForm(formData, profile);

  assert.ok(updates);
  assert.deepEqual(updates?.metadata, {
    height: 180,
    age: 28,
    skill_level: 5,
  });
});

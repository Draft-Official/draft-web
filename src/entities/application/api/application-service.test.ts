import assert from 'node:assert/strict';
import test from 'node:test';
import { ValidationError } from '@/shared/lib/errors';
import type { ParticipantInfo } from '@/shared/types/database.types';
import { validateGuestApplicationParticipants } from './application-service';

test('validateGuestApplicationParticipants throws when main participant required fields are missing', () => {
  const participants: ParticipantInfo[] = [
    {
      type: 'MAIN',
      name: '신청자',
      position: 'G',
    },
  ];

  assert.throws(
    () => validateGuestApplicationParticipants(participants),
    (error: unknown) => error instanceof ValidationError
  );
});

test('validateGuestApplicationParticipants throws when companion required fields are missing', () => {
  const participants: ParticipantInfo[] = [
    {
      type: 'MAIN',
      name: '신청자',
      position: 'G',
      height: 180,
      age: 29,
      skillLevel: 4,
    },
    {
      type: 'GUEST',
      name: '동반인',
      position: 'F',
      height: 175,
      age: 27,
    },
  ];

  assert.throws(
    () => validateGuestApplicationParticipants(participants),
    (error: unknown) => error instanceof ValidationError
  );
});

test('validateGuestApplicationParticipants passes when all participants include height/age/skillLevel', () => {
  const participants: ParticipantInfo[] = [
    {
      type: 'MAIN',
      name: '신청자',
      position: 'G',
      height: 180,
      age: 29,
      skillLevel: 4,
    },
    {
      type: 'GUEST',
      name: '동반인',
      position: 'F',
      height: 175,
      age: 27,
      skillLevel: 3,
    },
  ];

  assert.doesNotThrow(() => validateGuestApplicationParticipants(participants));
});

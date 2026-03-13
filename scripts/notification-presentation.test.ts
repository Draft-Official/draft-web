import assert from 'node:assert/strict';
import test from 'node:test';
import { Constants } from '../src/shared/types/database.types';
import {
  getNotificationPresentation,
  isNotificationTypeSupported,
} from '../src/features/notification/lib/presentation';

test('supports every notification type defined in the database enum', () => {
  for (const type of Constants.public.Enums.notification_type) {
    assert.equal(
      isNotificationTypeSupported(type),
      true,
      `${type} is missing from frontend notification presentation coverage`
    );

    const presentation = getNotificationPresentation(type);

    assert.ok(
      presentation.title.length > 0,
      `${type} is missing a notification title`
    );
    assert.ok(
      presentation.description.length > 0,
      `${type} is missing a notification description`
    );
    assert.ok(presentation.Icon, `${type} is missing a notification icon`);
  }
});

test('host announcement uses announcement-specific copy', () => {
  const presentation = getNotificationPresentation('HOST_ANNOUNCEMENT');

  assert.equal(presentation.title, '호스트 공지');
  assert.match(presentation.description, /공지/);
});

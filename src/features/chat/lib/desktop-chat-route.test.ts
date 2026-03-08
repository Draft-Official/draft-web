import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDesktopChatRoomRoute } from './desktop-chat-route';

test('parseDesktopChatRoomRoute parses /chat/rooms/:roomId route', () => {
  const parsed = parseDesktopChatRoomRoute('/chat/rooms/room-123?from=tab#bottom');

  assert.deepEqual(parsed, {
    roomId: 'room-123',
    fullPageHref: '/chat/rooms/room-123?from=tab#bottom',
  });
});

test('parseDesktopChatRoomRoute returns null for unsupported route', () => {
  assert.equal(parseDesktopChatRoomRoute('/chat'), null);
  assert.equal(parseDesktopChatRoomRoute('/chat/rooms'), null);
  assert.equal(parseDesktopChatRoomRoute('/team/rooms/room-123'), null);
});

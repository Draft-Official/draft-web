interface ParsedDesktopChatRoomRoute {
  roomId: string;
  fullPageHref: string;
}

export function parseDesktopChatRoomRoute(routePath: string): ParsedDesktopChatRoomRoute | null {
  try {
    const url = new URL(routePath, 'http://localhost');
    const segments = url.pathname.split('/').filter(Boolean);

    if (segments.length !== 3) return null;
    if (segments[0] !== 'chat' || segments[1] !== 'rooms') return null;
    if (!segments[2]) return null;

    return {
      roomId: segments[2],
      fullPageHref: `${url.pathname}${url.search}${url.hash}`,
    };
  } catch {
    return null;
  }
}

import { ImapFlow } from 'imapflow';

const CARRIER_DOMAINS = [
  'sktelecom.com',
  'sms.sktelecom.com',
  'kt.com',
  'sms.kt.com',
  'lguplus.co.kr',
  'sms.lguplus.co.kr',
  'mmsmail.uplus.co.kr',
];

interface ImapCheckResult {
  found: boolean;
  phoneNumber: string | null;
}

function extractBodyText(source: string): string {
  const parts: string[] = [source];

  const base64Matches = source.matchAll(
    /Content-Transfer-Encoding:\s*base64\r?\n(?:.*\r?\n)*?\r?\n([\s\S]*?)(?:\r?\n--|\s*$)/gi
  );
  for (const match of base64Matches) {
    try {
      const decoded = Buffer.from(match[1].replace(/\s/g, ''), 'base64').toString('utf-8');
      parts.push(decoded);
    } catch {}
  }

  const qpMatches = source.matchAll(
    /Content-Transfer-Encoding:\s*quoted-printable\r?\n(?:.*\r?\n)*?\r?\n([\s\S]*?)(?:\r?\n--|\s*$)/gi
  );
  for (const match of qpMatches) {
    const decoded = match[1]
      .replace(/=\r?\n/g, '')
      .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      );
    parts.push(decoded);
  }

  return parts.join('\n');
}

export async function checkVerificationEmail(
  code: string
): Promise<ImapCheckResult> {
  const client = new ImapFlow({
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: Number(process.env.IMAP_PORT || 993),
    secure: true,
    auth: {
      user: process.env.IMAP_USER!,
      pass: process.env.IMAP_PASSWORD!,
    },
    logger: false,
  });

  let result: ImapCheckResult = { found: false, phoneNumber: null };

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    try {
      const since = new Date(Date.now() - 10 * 60 * 1000);

      const messages = client.fetch(
        { since },
        { envelope: true, source: true }
      );

      // break/return 하지 않고 끝까지 소비해야 logout이 행되지 않음
      for await (const msg of messages) {
        if (result.found) continue;

        const fromAddress = msg.envelope?.from?.[0]?.address;
        if (!fromAddress) continue;

        const [localPart, domain] = fromAddress.split('@');
        if (!domain) continue;

        const isCarrier = CARRIER_DOMAINS.some(
          (d) => domain.toLowerCase() === d
        );
        if (!isCarrier) continue;

        const source = msg.source?.toString() || '';
        const bodyText = extractBodyText(source);

        if (!bodyText.includes(code)) continue;

        const digits = localPart.replace(/[^0-9]/g, '');
        if (/^01[0-9]\d{7,8}$/.test(digits)) {
          result = { found: true, phoneNumber: digits };
        }
      }
    } finally {
      lock.release();
    }
  } catch (err) {
    console.error('[IMAP] error:', err instanceof Error ? err.message : err);
  } finally {
    client.close();
  }

  return result;
}

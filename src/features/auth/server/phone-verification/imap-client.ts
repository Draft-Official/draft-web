import { ImapFlow } from 'imapflow';
import { PHONE_REGEX } from '@/shared/lib/phone-utils';

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
    } catch {
      // ignore malformed payloads
    }
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

/**
 * B방식: 한국 통신사 MMS→이메일 변환 시 코드가 text.txt 첨부파일에 들어오는 케이스 처리
 * multipart MIME 구조를 파싱해 text.txt 파트의 내용을 직접 추출
 */
function extractTextTxtAttachment(source: string): string | null {
  const boundaryMatch = source.match(
    /Content-Type:\s*multipart\/[^;]+;\s*boundary="?([^"\r\n]+)"?/i
  );
  if (!boundaryMatch) return null;

  const boundary = boundaryMatch[1].trim();
  const escapedBoundary = boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const mimeParts = source.split(new RegExp(`--${escapedBoundary}`));

  for (const part of mimeParts) {
    if (!/name="?text\.txt"?/i.test(part) && !/filename="?text\.txt"?/i.test(part)) continue;

    // 헤더와 본문 분리 (빈 줄 기준)
    const bodyMatch = part.match(/\r?\n\r?\n([\s\S]+)/);
    if (!bodyMatch) continue;

    let content = bodyMatch[1].trim();

    if (/Content-Transfer-Encoding:\s*base64/i.test(part)) {
      try {
        content = Buffer.from(content.replace(/\s/g, ''), 'base64').toString('utf-8');
      } catch {
        // ignore
      }
    } else if (/Content-Transfer-Encoding:\s*quoted-printable/i.test(part)) {
      content = content
        .replace(/=\r?\n/g, '')
        .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    }

    return content.trim();
  }

  return null;
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

      for await (const msg of messages) {
        if (result.found) continue;

        const fromAddress = msg.envelope?.from?.[0]?.address;
        if (!fromAddress) continue;

        const [localPart] = fromAddress.split('@');
        const digits = localPart.replace(/[^0-9]/g, '');
        if (!PHONE_REGEX.test(digits)) continue;

        const subject = msg.envelope?.subject || '';
        const source = msg.source?.toString() || '';
        const textTxt = extractTextTxtAttachment(source);
        const bodyText = extractBodyText(source);
        const searchText = subject + '\n' + (textTxt ? textTxt + '\n' : '') + bodyText;

        if (!searchText.includes(code)) continue;

        result = { found: true, phoneNumber: digits };
      }
    } finally {
      lock.release();
    }
  } catch (error) {
    console.error('[IMAP] error:', error instanceof Error ? error.message : error);
  } finally {
    client.close();
  }

  return result;
}

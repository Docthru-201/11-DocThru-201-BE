import nodemailer from 'nodemailer';
import { escapeHtml } from '#utils';
import { maskEmail } from '../common/utils/log-mask.util.js';

// 비밀번호 재설정 메일 발송
export async function sendPasswordResetEmail({ to, resetLink }) {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || user || 'noreply@localhost';

  if (!host) {
    if (process.env.NODE_ENV === 'development') {
      const linkBase = resetLink.includes('?')
        ? resetLink.slice(0, resetLink.indexOf('?'))
        : resetLink;
      console.info('[mail] SMTP 미설정 — 비밀번호 재설정 링크(로컬 확인용)', {
        to: maskEmail(to),
        resetLinkBase: linkBase,
        token: '[쿼리 token은 로그에 남기지 않음 — 브라우저/메일에서만 확인]',
      });
    } else {
      console.warn(
        '[mail] SMTP_HOST가 없어 비밀번호 재설정 메일을 보내지 못했습니다.',
        {
          to: maskEmail(to),
        },
      );
    }
    return;
  }

  try {
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });

    await transport.sendMail({
      from,
      to,
      subject: '[DocThru] 비밀번호 재설정',
      text: `아래 링크를 눌러 비밀번호를 재설정하세요.\n\n${resetLink}\n\n링크는 1시간 동안만 유효합니다.`,
      html: `<p>아래 링크를 눌러 비밀번호를 재설정하세요.</p><p><a href="${escapeHtml(resetLink)}">${escapeHtml(resetLink)}</a></p><p>링크는 1시간 동안만 유효합니다.</p>`,
    });
  } catch (err) {
    console.error(
      '[mail] 비밀번호 재설정 메일 발송 실패:',
      err?.message ?? err,
    );
  }
}

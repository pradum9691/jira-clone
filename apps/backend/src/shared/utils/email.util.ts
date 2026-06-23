import { logger } from './logger';

/**
 * Email service — Resend integration.
 *
 * Phase 2 (current): logs email to console so the full invitation
 * flow can be tested without a real Resend API key.
 *
 * Phase 3 (when RESEND_API_KEY is added to .env):
 *   1. npm install resend
 *   2. Uncomment the Resend block below and remove the placeholder.
 */

interface InvitationEmailParams {
  toEmail: string;
  inviterName: string;
  organizationName: string;
  role: string;
  acceptUrl: string;
}

export async function sendInvitationEmail(params: InvitationEmailParams): Promise<void> {
  // ── PLACEHOLDER (swap with Resend when API key is ready) ──────────────────
  logger.info(
    {
      to: params.toEmail,
      org: params.organizationName,
      role: params.role,
      acceptUrl: params.acceptUrl,
    },
    '[EMAIL PLACEHOLDER] Invitation email'
  );
  // ── END PLACEHOLDER ───────────────────────────────────────────────────────

  /*
  // ── RESEND IMPLEMENTATION (uncomment when ready) ──────────────────────────
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: params.toEmail,
    subject: `You're invited to join ${params.organizationName}`,
    html: `
      <h2>You've been invited!</h2>
      <p>${params.inviterName} has invited you to join
         <strong>${params.organizationName}</strong>
         as <strong>${params.role}</strong>.</p>
      <a href="${params.acceptUrl}" style="...">Accept Invitation</a>
      <p>This link expires in 7 days.</p>
    `,
  });
  // ── END RESEND ─────────────────────────────────────────────────────────────
  */
}
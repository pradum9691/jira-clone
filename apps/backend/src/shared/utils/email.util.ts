import { logger } from './logger';

interface InvitationEmailParams {
  toEmail: string;
  inviterName: string;
  organizationName: string;
  role: string;
  acceptUrl: string;
}

export async function sendInvitationEmail(params: InvitationEmailParams): Promise<void> {
  logger.info(
    {
      to: params.toEmail,
      org: params.organizationName,
      role: params.role,
      acceptUrl: params.acceptUrl,
    },
    '[EMAIL PLACEHOLDER] Invitation email'
  );
 }
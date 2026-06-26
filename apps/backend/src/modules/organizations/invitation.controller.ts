import { catchAsync } from '../../shared/utils/catch-async';
import { sendResponse, buildPagination } from '../../shared/utils/api-response';
import { InvitationStatus } from '../../shared/enums/role.enum';
import * as invitationService from './invitation.service';

 
export const createInvitation = catchAsync(async (req, res) => {
  const invitation = await invitationService.createInvitation(
    req.params.orgId,
    req.user!.userId,
    req.body
  );

  sendResponse(res, {
    statusCode: 201,
    data: invitation,
    message: 'Invitation sent successfully',
  });
});

 
export const listInvitations = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const status = req.query.status as InvitationStatus | undefined;

  const { data, total } = await invitationService.listInvitations(
    req.params.orgId,
    status,
    page,
    limit
  );

  sendResponse(res, {
    data,
    message: 'Invitations fetched successfully',
    pagination: buildPagination(page, limit, total),
  });
});

 
export const acceptInvitation = catchAsync(async (req, res) => {
  const result = await invitationService.acceptInvitation(
    req.params.token,
    req.user!.userId
  );

  sendResponse(res, {
    data: result,
    message: 'Invitation accepted successfully',
  });
});

 
export const revokeInvitation = catchAsync(async (req, res) => {
  const invitation = await invitationService.revokeInvitation(
    req.params.orgId,
    req.params.invitationId
  );

  sendResponse(res, {
    data: invitation,
    message: 'Invitation revoked successfully',
  });
});
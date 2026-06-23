import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from '../modules/auth/auth.routes';
import organizationRoutes from '../modules/organizations/organization.routes';
import { invitationAcceptRouter } from '../modules/organizations/invitation.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/invitations', invitationAcceptRouter);

export default router;
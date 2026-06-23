import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema } from './auth.validation';
import * as authController from './auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refresh);
router.post('/logout', authController.logout);

export default router;

import { Router, Request, Response } from 'express';
import { Models } from '../database';
import AuthRoutes from './auth';
import BiometricRoutes from './biometrics';

const router = Router();

const authMiddleware = async (req: Request, _: Response, next: any) => {
  const user = await Models.User.findById('60c13dba54c562024d82b551');

  // @ts-expect-error
  req.user = user;

  next();
};

router.use('/auth', AuthRoutes);
router.use('/biometrics', authMiddleware, BiometricRoutes);

export default router;

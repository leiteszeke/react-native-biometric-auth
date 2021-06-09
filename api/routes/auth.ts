import { Request, Response, Router } from 'express';
import { Models } from '../database';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await Models.User.findOne({
      email,
      password,
    });

    if (!user) {
      throw new Error('not_found');
    }

    return res.status(200).json({ user });
  } catch (e) {
    return res.status(401).json({ message: 'unauthorized' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userExists = await Models.User.findOne({
      email,
      password,
    });

    if (userExists) {
      throw new Error('user_exists');
    }

    const user = new Models.User({
      email,
      password,
    });

    await user.save();

    return res.status(201).json({ user });
  } catch (e) {
    return res.status(400).json({ message: 'bad_request' });
  }
});

export default router;

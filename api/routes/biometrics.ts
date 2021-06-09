import { Request, Response, Router } from 'express';
import NodeRSA from 'node-rsa';
import { readFileSync, writeFileSync } from 'fs';
import { Buffer } from 'node:buffer';
import { Models } from '../database';
import { ObjectId } from 'mongodb';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { userId, payload, publicKey } = req.body;

  const device = new Models.UserDevice({
    userId: new ObjectId(userId),
    deviceId: payload,
    publicKey,
  });

  await device.save();

  res.status(200).json({ device });
});

router.post('/auth', async (req: Request, res: Response) => {
  const { signature, payload } = req.body;

  if (validate(signature, payload)) {
    const device = await Models.UserDevice.findOne({
      deviceId: payload,
    });

    if (!device) {
      throw new Error('not_found');
    }

    const user = await Models.User.findById(device.userId);

    if (!user) {
      throw new Error('not_found');
    }

    return res.status(200).json({ user });
  }

  return res.status(401).json({ message: 'not authorized' });
});

const validate = async (signature: string, payload: string) => {
  const user = await Models.User.findOne({
    deviceId: payload,
  });

  if (!user) {
    return false;
  }

  const publicKeyBuffer = Buffer.from(user.publicKey, 'base64');
  const key = new NodeRSA();
  const signer = key.importKey(publicKeyBuffer, 'pkcs1-public-der');

  return signer.verify(Buffer.from(payload), signature, 'utf8', 'base64');
};

export default router;

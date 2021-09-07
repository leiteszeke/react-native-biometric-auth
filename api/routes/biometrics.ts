import { Request, Response, Router } from 'express';
import NodeRSA, { Format } from 'node-rsa';
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

  if (await validate(signature, payload)) {
    const device = await Models.UserDevice.findOne({
      deviceId: payload,
    });

    if (device === null) {
      return res.status(401).json({ message: 'device not found' });
    }

    const user = await Models.User.findById(device.userId);

    if (user === null) {
      return res.status(401).json({ message: 'user not found' });
    }

    return res.status(200).json({ user });
  }

  return res.status(401).json({ message: 'not authorized' });
});

const validate = async (signature: string, payload: string) => {
  const devices = await Models.UserDevice.find({
    deviceId: payload,
  });

  if (!devices || devices.length === 0) {
    return false;
  }

  const validation = await Promise.all(
    devices.map(device => {
      try {
        const publicKeyBuffer = Buffer.from(device.publicKey, 'base64');
        const key = new NodeRSA();
        const signer = key.importKey(publicKeyBuffer, 'public-der' as Format);

        return signer.verify(Buffer.from(payload), signature, 'utf8', 'base64');
      } catch (e) {
        return false;
      }
    }),
  );

  return validation.some(r => r);
};

export default router;

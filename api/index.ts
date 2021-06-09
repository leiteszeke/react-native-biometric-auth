import express, { Request, Response } from 'express';
import NodeRSA from 'node-rsa';
import { readFileSync, writeFileSync } from 'fs';
import { Buffer } from 'node:buffer';

const app = express();

app.use(express.json());

app.post('/login+', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email === 'ezequiel@leites.dev' && password === 'demo') {
    res.status(200).json({ user: { id: 1 } });
  } else {
    res.status(401).json({ message: 'unauthorized' });
  }
});

app.post('/biometrics', (req: Request, res: Response) => {
  const { userId, payload, publicKey } = req.body;

  const outputFile = JSON.parse(
    readFileSync('./database.json', { encoding: 'utf-8' }),
  );

  outputFile[payload] = { publicKey, userId };

  writeFileSync('./database.json', JSON.stringify(outputFile, null, 2));

  res.status(200).json({});
});

app.post('/bio-auth', (req: Request, res: Response) => {
  const { signature, payload } = req.body;

  if (validate(signature, payload)) {
    const database = JSON.parse(
      readFileSync('./database.json', { encoding: 'utf-8' }),
    );

    const user = database[payload];

    res.status(200).json({ user: { id: user.userId } });
  } else {
    res.status(401).json({ message: 'not authorized' });
  }
});

const validate = (signature: string, payload: string) => {
  const database = JSON.parse(
    readFileSync('./database.json', { encoding: 'utf-8' }),
  );

  if (!database[payload]) {
    return false;
  }

  const user = database[payload];

  const publicKeyBuffer = Buffer.from(user.publicKey, 'base64');
  const key = new NodeRSA();
  const signer = key.importKey(publicKeyBuffer, 'pkcs1-public-der');

  return signer.verify(Buffer.from(payload), signature, 'utf8', 'base64');
};

const port = process.env.PORT || 3500;

app.listen(port, () => console.log(`Server running in port ${port}`));

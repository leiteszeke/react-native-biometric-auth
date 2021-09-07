require('dotenv').config();

import mongoose from 'mongoose';
import UserSchema from './models/UserModel';
import UserDeviceSchema from './models/UserDeviceModel';

console.info(
  `Trying to connect to mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
);

mongoose.connect(
  `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?retryWrites=true&w=majority&authSource=admin&readPreference=primary&ssl=false`,
  { useNewUrlParser: true, useUnifiedTopology: true },
  err => {
    if (err) {
      throw err;
    }
    console.info('Connected');
  },
);

mongoose.model('users', UserSchema);
mongoose.model('userDevices', UserDeviceSchema);

export const Models = {
  User: mongoose.models.users,
  UserDevice: mongoose.models.userDevices,
};

export default mongoose;

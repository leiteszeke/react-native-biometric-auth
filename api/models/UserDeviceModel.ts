import { Schema, Types } from 'mongoose';

const UserDeviceSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
  },
  publicKey: {
    type: String,
  },
});

export default UserDeviceSchema;

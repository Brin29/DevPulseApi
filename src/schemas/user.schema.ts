import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser, IUserMethods } from '../models/user.model';

type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: "local"
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
    enum: ['Admin', 'Project Manager', 'Team Member'],
    default: 'Team Member',
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  // isVerified: {
  //   type: Boolean,
  //   default: false,
  // },
});

UserSchema.pre<HydratedDocument<IUser, IUserMethods>>('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser, UserModel>('User', UserSchema);

export default User;
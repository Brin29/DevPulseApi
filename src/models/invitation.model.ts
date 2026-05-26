import { Types } from "mongoose";

export interface IInvitation {
  teamId: Types.ObjectId;
  email: string;
  role: string;
  token: string;
  status: string;
  invitedBy: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

import { Types } from "mongoose";

export interface IMagicLink {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  used: Boolean;
}

export interface MagicLinkRequest {
  magic_token: string;
}
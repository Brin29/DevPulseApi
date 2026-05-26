import { Types } from "mongoose";

export interface IOrganizationMember {
  teamId: Types.ObjectId;
  userId: Types.ObjectId;
  role: string;
  joinedAt: Date;
  updatedAt: Date;
}

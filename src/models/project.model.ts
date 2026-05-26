import { Types } from "mongoose";

export interface IProject {
  name: string;
  description?: string;
  teamId: Types.ObjectId;
  ownerId: Types.ObjectId;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

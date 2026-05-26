import { Types } from "mongoose";

export interface ITeam {
  name: string;
  description: string;
  slug: string;
  logo?: string;
  ownerId: Types.ObjectId;
  members?: Types.ObjectId[];
  projects?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

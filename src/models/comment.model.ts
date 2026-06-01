import { Types } from "mongoose";

export interface IComment {
  taskId: Types.ObjectId;
  authorId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

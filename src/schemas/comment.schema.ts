import mongoose, { Schema, Model } from "mongoose";
import { IComment } from "../models/comment.model";

type CommentModel = Model<IComment>;

const CommentSchema = new Schema<IComment, CommentModel>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

CommentSchema.index({ taskId: 1, createdAt: -1 });

const Comment = mongoose.model<IComment, CommentModel>("Comment", CommentSchema);
export default Comment;

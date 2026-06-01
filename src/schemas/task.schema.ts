import mongoose, { Schema, Model } from "mongoose";
import { ITask, TaskStatus, TaskPriority, TaskType } from "../models/task.model";

type TaskModel = Model<ITask>;

const TaskSchema = new Schema<ITask, TaskModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(TaskType),
      default: TaskType.TASK,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.OPEN,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    // projectId: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Project",
    //   index: true,
    // },
    // photos: {
    //   type: [String],
    //   default: [],
    // },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

TaskSchema.index({ teamId: 1, status: 1 });
TaskSchema.index({ teamId: 1, assigneeId: 1 });

const Task = mongoose.model<ITask, TaskModel>("Task", TaskSchema);
export default Task;

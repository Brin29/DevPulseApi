import { Types } from "mongoose";

export enum TaskStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum TaskType {
  BUG = "BUG",
  FEAUTERE = "FEAUTERE",
  TASK = "TASK"
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface ITask {
  title: string;
  description?: string;
  type?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: Types.ObjectId;
  reporterId: Types.ObjectId;
  teamId: Types.ObjectId;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

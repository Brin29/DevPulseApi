import { Request } from "../models/request.model";
import { TaskStatus, TaskPriority, TaskType } from "../models/task.model";

export interface CreateTaskRequest {
  Body: Request<{
    title: string;
    description: string;
    type: TaskType;
    priority: TaskPriority;
    assigneeId: string;
    dueDate: string;
  }>;
  Params: { teamId: string };
}

export interface UpdateTaskRequest {
  Body: Request<{
    title?: string;
    description?: string;
    type?: TaskType;
    priority?: TaskPriority;
    assigneeId?: string | null;
    dueDate?: string | null;
  }>;
  Params: { teamId: string; id: string };
}

export interface UpdateTaskStatusRequest {
  Body: Request<{ status: TaskStatus }>;
  Params: { teamId: string; id: string };
}

export interface GetTaskRequest {
  Params: { teamId: string; id: string };
}

export interface ListTasksRequest {
  Params: { teamId: string };
  Querystring: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    page?: string;
    limit?: string;
  };
}

export interface AddCommentRequest {
  Body: Request<{ content: string }>;
  Params: { teamId: string; id: string };
}

export interface UpdateCommentRequest {
  Body: Request<{ content: string }>;
  Params: { teamId: string; id: string; commentId: string };
}

export interface DeleteCommentRequest {
  Params: { teamId: string; id: string; commentId: string };
}

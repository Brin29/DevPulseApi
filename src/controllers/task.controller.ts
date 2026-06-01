import { FastifyRequest, FastifyReply } from "fastify";
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  GetTaskRequest,
  ListTasksRequest,
  AddCommentRequest,
  UpdateCommentRequest,
  DeleteCommentRequest,
} from "../types/task.types";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from "../services/task.service";
import { TaskPriority } from "../models/task.model";

export async function create(
  request: FastifyRequest<CreateTaskRequest>,
  reply: FastifyReply,
) {
  const { teamId } = request.params;
  const { title, description, type, priority, assigneeId, dueDate } = request.body.data;
  const { id } = (request as any).user;

  const task = await createTask(
    { title, description, type, priority, assigneeId, dueDate },
    teamId,
    id,
  );

  return reply.status(201).send({ message: "Tarea creada exitosamente", task });
}

export async function list(
  request: FastifyRequest<ListTasksRequest>,
  reply: FastifyReply,
) {
  const { teamId } = request.params;
  const { status, priority, assigneeId } = request.query;
  // const page = parseInt(request.query.page || "1", 10);
  // const limit = parseInt(request.query.limit || "20", 10);
  const { id } = (request as any).user;

  const result = await getTasks(
    teamId,
    id,
    { status, priority: priority as TaskPriority, assigneeId },
  );

  return reply.send(result);
}

export async function getById(
  request: FastifyRequest<GetTaskRequest>,
  reply: FastifyReply,
) {
  const { teamId, id } = request.params;
  const userId = (request as any).user.id;

  const task = await getTaskById(id, teamId, userId);

  return reply.send({ task });
}

export async function update(
  request: FastifyRequest<UpdateTaskRequest>,
  reply: FastifyReply,
) {
  const { teamId, id } = request.params;
  const userId = (request as any).user.id;
  const data = request.body.data;

  const task = await updateTask(id, teamId, userId, data);

  return reply.send({ message: "Tarea actualizada exitosamente", task });
}

export async function updateStatus(
  request: FastifyRequest<UpdateTaskStatusRequest>,
  reply: FastifyReply,
) {
  const { teamId, id } = request.params;
  const { status } = request.body.data;
  const userId = (request as any).user.id;

  const task = await updateTaskStatus(id, teamId, userId, status);

  return reply.send({ message: "Estado actualizado exitosamente", task });
}

export async function remove(
  request: FastifyRequest<GetTaskRequest>,
  reply: FastifyReply,
) {
  const { teamId, id } = request.params;
  const userId = (request as any).user.id;

  await deleteTask(id, teamId, userId);

  return reply.send({ message: "Tarea eliminada exitosamente" });
}

export async function addCommentHandler(
  request: FastifyRequest<AddCommentRequest>,
  reply: FastifyReply,
) {
  const { teamId, id } = request.params;
  const { content } = request.body.data;
  const userId = (request as any).user.id;

  const comment = await addComment(id, teamId, userId, content);

  return reply.status(201).send({ message: "Comentario agregado exitosamente", comment });
}

export async function listComments(
  request: FastifyRequest<GetTaskRequest>,
  reply: FastifyReply,
) {
  const { teamId, id } = request.params;
  const userId = (request as any).user.id;

  const comments = await getComments(id, teamId, userId);

  return reply.send({ comments });
}

export async function updateCommentHandler(
  request: FastifyRequest<UpdateCommentRequest>,
  reply: FastifyReply,
) {
  const { teamId, id, commentId } = request.params;
  const { content } = request.body.data;
  const userId = (request as any).user.id;

  const comment = await updateComment(commentId, id, teamId, userId, content);

  return reply.send({ message: "Comentario actualizado exitosamente", comment });
}

export async function removeComment(
  request: FastifyRequest<DeleteCommentRequest>,
  reply: FastifyReply,
) {
  const { teamId, id, commentId } = request.params;
  const userId = (request as any).user.id;

  await deleteComment(commentId, id, teamId, userId);

  return reply.send({ message: "Comentario eliminado exitosamente" });
}

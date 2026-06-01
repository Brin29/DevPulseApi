import Task from "../schemas/task.schema";
import Comment from "../schemas/comment.schema";
import OrganizationMember from "../schemas/organizationMember.schema";
import { TaskStatus, TaskPriority, TaskType } from "../models/task.model";

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.OPEN]: [TaskStatus.IN_PROGRESS, TaskStatus.CLOSED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.OPEN, TaskStatus.RESOLVED, TaskStatus.CLOSED],
  [TaskStatus.RESOLVED]: [TaskStatus.IN_PROGRESS, TaskStatus.CLOSED],
  [TaskStatus.CLOSED]: [TaskStatus.OPEN],
};

async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
  const member = await OrganizationMember.findOne({ teamId, userId });
  return !!member;
}

function getPopulateOptions() {
  return [
    { path: "reporterId", select: "firstName lastName email" },
    { path: "assigneeId", select: "firstName lastName email" },
  ];
}

export async function createTask(
  data: {
    title: string;
    description: string;
    type: TaskType;
    priority: TaskPriority;
    assigneeId: string;
    dueDate: string;
  },
  teamId: string,
  reporterId: string,
) {
  const member = await isTeamMember(teamId, reporterId);
  if (!member) throw { status: 403, message: "No eres miembro de este equipo" };

  const task = new Task({
    title: data.title,
    description: data.description,
    type: data.type || TaskType.TASK,
    priority: data.priority || TaskPriority.MEDIUM,
    assigneeId: data.assigneeId,
    reporterId,
    teamId,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
  });

  await task.save();
  return task.populate(getPopulateOptions());
}

export async function getTasks(
  teamId: string,
  userId: string,
  filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
  },
  // page: number = 1,
  // limit: number = 20,
) {
  const member = await isTeamMember(teamId, userId);
  if (!member) throw { status: 403, message: "No eres miembro de este equipo" };

  const query: any = { teamId };
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.assigneeId) query.assigneeId = filters.assigneeId;

  // const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .sort({ createdAt: -1 })
      // .skip(skip)
      // .limit(limit)
      .populate(getPopulateOptions()),
    Task.countDocuments(query),
  ]);

  return {
    tasks,
    total,
    // page,
    // limit,
    // totalPages: Math.ceil(total / limit),
  };
}

export async function getTaskById(taskId: string, teamId: string, userId: string) {
  const task = await Task.findOne({ _id: taskId, teamId }).populate(getPopulateOptions());
  if (!task) throw { status: 404, message: "Tarea no encontrada" };

  const member = await isTeamMember(teamId, userId);
  if (!member) throw { status: 403, message: "No eres miembro de este equipo" };

  return task;
}

export async function updateTask(
  taskId: string,
  teamId: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    type?: TaskType;
    priority?: TaskPriority;
    assigneeId?: string | null;
    dueDate?: string | null;
  },
) {
  const task = await Task.findOne({ _id: taskId, teamId });
  if (!task) throw { status: 404, message: "Tarea no encontrada" };

  const member = await isTeamMember(teamId, userId);
  if (!member) throw { status: 403, message: "No eres miembro de este equipo" };

  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description;
  if (data.type !== undefined) task.type = data.type;
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.assigneeId !== undefined) task.assigneeId = data.assigneeId as any;
  if (data.dueDate !== undefined) task.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;

  await task.save();
  return task.populate(getPopulateOptions());
}

export async function updateTaskStatus(
  taskId: string,
  teamId: string,
  userId: string,
  newStatus: TaskStatus,
) {
  const task = await Task.findOne({ _id: taskId, teamId });
  if (!task) throw { status: 404, message: "Tarea no encontrada" };

  const member = await isTeamMember(teamId, userId);
  if (!member) throw { status: 403, message: "No eres miembro de este equipo" };

  const currentStatus = task.status as TaskStatus;
  const allowed = VALID_TRANSITIONS[currentStatus];

  // if (!allowed || !allowed.includes(newStatus)) {
  //   throw {
  //     status: 400,
  //     message: `No puedes cambiar el estado de ${currentStatus} a ${newStatus}`,
  //   };
  // }

  task.status = newStatus;
  await task.save();
  return task.populate(getPopulateOptions());
}

export async function deleteTask(taskId: string, teamId: string, userId: string) {
  const task = await Task.findOne({ _id: taskId, teamId });
  if (!task) throw { status: 404, message: "Tarea no encontrada" };

  const member = await isTeamMember(teamId, userId);
  if (!member) throw { status: 403, message: "No eres miembro de este equipo" };

  await Promise.all([
    Comment.deleteMany({ taskId }),
    Task.findByIdAndDelete(taskId),
  ]);
}

export async function addComment(
  taskId: string,
  teamId: string,
  authorId: string,
  content: string,
) {
  const task = await Task.findOne({ _id: taskId, teamId });
  if (!task) throw { status: 404, message: "Tarea no encontrada" };

  const member = await isTeamMember(teamId, authorId);
  if (!member) throw { status: 403, message: "No eres miembro de este equipo" };

  const comment = await Comment.create({ taskId, authorId, content });
  return comment.populate({ path: "authorId", select: "firstName lastName email" });
}

export async function getComments(taskId: string, teamId: string, userId: string) {
  const task = await Task.findOne({ _id: taskId, teamId });
  if (!task) throw { status: 404, message: "Tarea no encontrada" };

  const member = await isTeamMember(teamId, userId);
  if (!member) throw { status: 403, message: "No eres miembro de este equipo" };

  return Comment.find({ taskId })
    .sort({ createdAt: -1 })
    .populate({ path: "authorId", select: "firstName lastName email" });
}

export async function updateComment(
  commentId: string,
  taskId: string,
  teamId: string,
  userId: string,
  content: string,
) {
  const task = await Task.findOne({ _id: taskId, teamId });
  if (!task) throw { status: 404, message: "Tarea no encontrada" };

  const comment = await Comment.findOne({ _id: commentId, taskId });
  if (!comment) throw { status: 404, message: "Comentario no encontrado" };

  if (comment.authorId.toString() !== userId) {
    throw { status: 403, message: "Solo el autor puede editar el comentario" };
  }

  comment.content = content;
  await comment.save();
  return comment.populate({ path: "authorId", select: "firstName lastName email" });
}

export async function deleteComment(
  commentId: string,
  taskId: string,
  teamId: string,
  userId: string,
) {
  const task = await Task.findOne({ _id: taskId, teamId });
  if (!task) throw { status: 404, message: "Tarea no encontrada" };

  const comment = await Comment.findOne({ _id: commentId, taskId });
  if (!comment) throw { status: 404, message: "Comentario no encontrado" };

  const member = await OrganizationMember.findOne({ teamId, userId });
  const isTeamAdmin = member && (member as any).role === "Admin";
  const isOwner = teamId === userId;

  if (comment.authorId.toString() !== userId && !isTeamAdmin) {
    throw { status: 403, message: "No tienes permiso para eliminar este comentario" };
  }

  await Comment.findByIdAndDelete(commentId);
}

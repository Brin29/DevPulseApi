import Task from "../schemas/task.schema";
import OrganizationMember from "../schemas/organizationMember.schema";
import { Types } from "mongoose";

async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
  const member = await OrganizationMember.findOne({ teamId, userId });
  return !!member;
}

export async function getTeamReport(
  teamId: string,
  userId: string,
  filters: { status?: string; priority?: string; assigneeId?: string } = {},
) {
  const member = await isTeamMember(teamId, userId);
  if (!member) throw { status: 403, message: "No eres miembro de este equipo" };

  const now = new Date();

  const match: any = { teamId: new Types.ObjectId(teamId) };
  if (filters.status) match.status = filters.status;
  if (filters.priority) match.priority = filters.priority;
  if (filters.assigneeId) match.assigneeId = new Types.ObjectId(filters.assigneeId);

  const [result] = await Task.aggregate([
    { $match: match },
    {
      $facet: {
        totalTasks: [{ $count: "count" }],
        byStatus: [
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $project: { _id: 0, status: "$_id", count: 1 } },
        ],
        byPriority: [
          { $group: { _id: "$priority", count: { $sum: 1 } } },
          { $project: { _id: 0, priority: "$_id", count: 1 } },
        ],
        completedTasks: [
          {
            $match: {
              status: { $in: ["RESOLVED", "CLOSED"] },
            },
          },
          { $count: "count" },
        ],
        pendingTasks: [
          {
            $match: {
              status: { $in: ["OPEN", "IN_PROGRESS"] },
            },
          },
          { $count: "count" },
        ],
        overdueTasks: [
          {
            $match: {
              dueDate: { $lt: now },
              status: { $nin: ["RESOLVED", "CLOSED"] },
            },
          },
          { $count: "count" },
        ],
        byDeveloper: [
          {
            $group: {
              _id: "$assigneeId",
              totalAsignadas: { $sum: 1 },
              completadas: {
                $sum: {
                  $cond: [
                    { $in: ["$status", ["RESOLVED", "CLOSED"]] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              userId: "$_id",
              firstName: "$user.firstName",
              lastName: "$user.lastName",
              email: "$user.email",
              totalAsignadas: 1,
              completadas: 1,
            },
          },
        ],
      },
    },
  ]);

  return {
    total: result.totalTasks[0]?.count ?? 0,
    completadas: result.completedTasks[0]?.count ?? 0,
    pendientes: result.pendingTasks[0]?.count ?? 0,
    vencidas: result.overdueTasks[0]?.count ?? 0,
    porEstado: result.byStatus,
    porPrioridad: result.byPriority,
    porDesarrollador: result.byDeveloper,
  };
}

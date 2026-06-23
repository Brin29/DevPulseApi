import Task from "../schemas/task.schema";
import OrganizationMember from "../schemas/organizationMember.schema";
import { Types } from "mongoose";

export async function getUserStats(userId: string) {
  const objectId = new Types.ObjectId(userId);

  const [teamsCount, taskStats] = await Promise.all([
    OrganizationMember.countDocuments({ userId: objectId }),
    Task.aggregate([
      { $match: { assigneeId: objectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          activas: {
            $sum: {
              $cond: [
                { $in: ["$status", ["OPEN", "IN_PROGRESS"]] },
                1,
                0,
              ],
            },
          },
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
    ]),
  ]);

  const total = taskStats[0]?.total ?? 0;
  const activas = taskStats[0]?.activas ?? 0;
  const completadas = taskStats[0]?.completadas ?? 0;
  const progreso = total > 0 ? Math.round((completadas / total) * 100) : 0;

  return {
    equipos: teamsCount,
    tareasActivas: activas,
    tareasCompletadas: completadas,
    progreso,
  };
}

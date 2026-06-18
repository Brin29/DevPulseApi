import { FastifyRequest, FastifyReply } from "fastify";
import { GetTeamReportRequest } from "../types/report.types";
import { getTeamReport } from "../services/report.service";

export async function teamReport(
  request: FastifyRequest<GetTeamReportRequest>,
  reply: FastifyReply,
) {
  const { teamId } = request.params;
  const { status, priority, assigneeId } = request.query;
  const userId = (request as any).user.id;

  const report = await getTeamReport(teamId, userId, { status, priority, assigneeId });

  return reply.send(report);
}

import { FastifyRequest, FastifyReply } from "fastify";
import { getUserStats } from "../services/user.service";

export async function userStats(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = (request as any).user.id;
  const stats = await getUserStats(userId);
  return reply.send(stats);
}

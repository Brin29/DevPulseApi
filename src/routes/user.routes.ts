import { FastifyInstance } from "fastify";
import { userStats } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const userStatsSchema = {
  description: "Obtener estadísticas del usuario autenticado",
  tags: ["User"],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      description: "Estadísticas del usuario",
      type: "object",
      properties: {
        equipos: { type: "number" },
        tareasActivas: { type: "number" },
        tareasCompletadas: { type: "number" },
        progreso: { type: "number" },
      },
    },
  },
};

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/user/stats",
    { preHandler: authenticate, schema: userStatsSchema },
    userStats,
  );
}

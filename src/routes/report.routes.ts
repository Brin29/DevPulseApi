import { FastifyInstance } from "fastify";
import { teamReport } from "../controllers/reports.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { GetTeamReportRequest } from "../types/report.types";

const teamReportSchema = {
  description: "Obtener reporte de tareas del equipo",
  tags: ["Reports"],
  security: [{ bearerAuth: [] }],
  querystring: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
        description: "Filtrar por estado",
      },
      priority: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        description: "Filtrar por prioridad",
      },
      assigneeId: {
        type: "string",
        description: "Filtrar por desarrollador",
      },
    },
  },
  params: {
    type: "object",
    required: ["teamId"],
    properties: {
      teamId: { type: "string", description: "ID del equipo" },
    },
  },
  response: {
    200: {
      description: "Reporte del equipo",
      type: "object",
      properties: {
        total: { type: "number" },
        completadas: { type: "number" },
        pendientes: { type: "number" },
        vencidas: { type: "number" },
        porEstado: {
          type: "array",
          items: {
            type: "object",
            properties: {
              status: { type: "string" },
              count: { type: "number" },
            },
          },
        },
        porPrioridad: {
          type: "array",
          items: {
            type: "object",
            properties: {
              priority: { type: "string" },
              count: { type: "number" },
            },
          },
        },
        porDesarrollador: {
          type: "array",
          items: {
            type: "object",
            properties: {
              userId: { type: "string" },
              firstName: { type: "string" },
              lastName: { type: "string" },
              email: { type: "string" },
              totalAsignadas: { type: "number" },
              completadas: { type: "number" },
            },
          },
        },
      },
    },
  },
};

export default async function reportRoutes(fastify: FastifyInstance) {
  fastify.get<GetTeamReportRequest>(
    "/teams/:teamId/reports",
    { preHandler: authenticate, schema: teamReportSchema },
    teamReport,
  );
}

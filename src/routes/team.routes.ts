import { FastifyInstance } from "fastify";
import {
  create,
  list,
  getById,
  update,
  remove,
  invite,
  accept,
  listInvitations,
  cancel,
} from "../controllers/team.controller";
import { authenticate } from "../middlewares/auth.middleware";
import {
  CreateTeamRequest,
  UpdateTeamRequest,
  GetTeamRequest,
  InviteMemberRequest,
  AcceptInvitationRequest,
} from "../types/team.types";

const createTeamSchema = {
  description: "Crear un nuevo equipo",
  tags: ["Teams"],
  security: [{ bearerAuth: [] }],
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        required: ["name", "slug"],
        properties: {
          name: { type: "string", description: "Nombre del equipo" },
          description: {
            type: "string",
            description: "Descripción del equipo",
          },
          slug: { type: "string", description: "Slug único del equipo" },
          logo: { type: "string", description: "URL del logo" },
        },
      },
    },
  },
  response: {
    201: {
      description: "Equipo creado exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        team: { type: "object" },
      },
    },
    409: {
      description: "El slug ya está en uso",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const listTeamsSchema = {
  description: "Obtener equipos del usuario autenticado",
  tags: ["Teams"],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      description: "Lista de equipos",
      type: "object",
      properties: {
        teams: { type: "array" },
      },
    },
  },
};

const getTeamSchema = {
  description: "Obtener un equipo por ID",
  operationId: "getTeamById",
  tags: ["Teams"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del equipo" },
    },
  },
  response: {
    200: {
      description: "Equipo encontrado",
      type: "object",
      properties: {
        team: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            slug: { type: "string" },
            logo: { type: "string" },
            ownerId: { type: "string" },
            members: { type: "array" },
            projects: { type: "array" },
          },
        },
      },
    },
    404: {
      description: "Equipo no encontrado",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const updateTeamSchema = {
  description: "Actualizar un equipo",
  tags: ["Teams"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del equipo" },
    },
  },
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nombre del equipo" },
          description: {
            type: "string",
            description: "Descripción del equipo",
          },
          slug: { type: "string", description: "Slug único del equipo" },
          logo: { type: "string", description: "URL del logo" },
        },
      },
    },
  },
  response: {
    200: {
      description: "Equipo actualizado exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        team: { type: "object" },
      },
    },
    403: {
      description: "No autorizado",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const deleteTeamSchema = {
  description: "Eliminar un equipo",
  tags: ["Teams"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del equipo" },
    },
  },
  response: {
    200: {
      description: "Equipo eliminado exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    403: {
      description: "No autorizado",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const inviteMemberSchema = {
  description: "Invitar un miembro al equipo",
  tags: ["Teams"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del equipo" },
    },
  },
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "Correo del invitado",
          },
          role: {
            type: "string",
            enum: ["Admin", "Developer", "Viewer"],
            description: "Rol del miembro",
          },
        },
      },
    },
  },
  response: {
    201: {
      description: "Invitación enviada exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        invitation: { type: "object" },
      },
    },
  },
};

const acceptInvitationSchema = {
  description: "Aceptar una invitación a un equipo",
  tags: ["Teams"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["token"],
    properties: {
      token: { type: "string", description: "Token de invitación" },
    },
  },
  response: {
    200: {
      description: "Invitación aceptada exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        teamId: { type: "string" },
      },
    },
    410: {
      description: "Invitación expirada",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const listInvitationsSchema = {
  description: "Listar invitaciones de un equipo",
  tags: ["Teams"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID del equipo" },
    },
  },
  response: {
    200: {
      description: "Lista de invitaciones",
      type: "object",
      properties: {
        invitations: { type: "array" },
      },
    },
  },
};

const cancelInvitationSchema = {
  description: "Cancelar una invitación",
  tags: ["Teams"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "ID de la invitación" },
    },
  },
  response: {
    200: {
      description: "Invitación cancelada exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        invitation: { type: "object" },
      },
    },
  },
};

export default async function teamRoutes(fastify: FastifyInstance) {
  fastify.post<CreateTeamRequest>(
    "/teams",
    { preHandler: authenticate, schema: createTeamSchema },
    create,
  );
  fastify.get(
    "/teams",
    { preHandler: authenticate, schema: listTeamsSchema },
    list,
  );
  fastify.get<GetTeamRequest>(
    "/teams/:id",
    { preHandler: authenticate, schema: getTeamSchema },
    getById,
  );
  fastify.put<UpdateTeamRequest>(
    "/teams/:id",
    { preHandler: authenticate, schema: updateTeamSchema },
    update,
  );
  fastify.delete<GetTeamRequest>(
    "/teams/:id",
    { preHandler: authenticate, schema: deleteTeamSchema },
    remove,
  );
  fastify.post<InviteMemberRequest>(
    "/teams/:id/invitations",
    { preHandler: authenticate, schema: inviteMemberSchema },
    invite,
  );
  fastify.get<GetTeamRequest>(
    "/teams/:id/invitations",
    { preHandler: authenticate, schema: listInvitationsSchema },
    listInvitations,
  );
  fastify.post<AcceptInvitationRequest>(
    "/teams/invitations/:token/accept",
    { preHandler: authenticate, schema: acceptInvitationSchema },
    accept,
  );
  fastify.delete<{ Params: { id: string } }>(
    "/teams/invitations/:id",
    { preHandler: authenticate, schema: cancelInvitationSchema },
    cancel,
  );
}

import { FastifyInstance } from "fastify";
import {
  create,
  list,
  getById,
  update,
  updateStatus,
  remove,
  addCommentHandler,
  listComments,
  updateCommentHandler,
  removeComment,
} from "../controllers/task.controller";
import { authenticate } from "../middlewares/auth.middleware";
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

const createTaskSchema = {
  description: "Crear una nueva tarea",
  tags: ["Tasks"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["teamId"],
    properties: {
      teamId: { type: "string", description: "ID del equipo" },
    },
  },
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", description: "Título de la tarea" },
          description: {
            type: "string",
            description: "Descripción de la tarea",
          },
          priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            description: "Prioridad de la tarea",
          },
          assigneeId: { type: "string", description: "ID del responsable" },
          dueDate: {
            type: "string",
            description: "Fecha de vencimiento (ISO)",
          },
          type: {
            type: "string",
            enum: ["BUG", "FEAUTERE", "TASK"],
            description: "Tipo de tarea",
          },
        },
      },
    },
  },
  response: {
    201: {
      description: "Tarea creada exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        task: { type: "object" },
      },
    },
  },
};

const listTasksSchema = {
  description: "Listar tareas del equipo",
  tags: ["Tasks"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["teamId"],
    properties: {
      teamId: { type: "string", description: "ID del equipo" },
    },
  },
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
      assigneeId: { type: "string", description: "Filtrar por responsable" },
      // page: { type: "string", description: "Número de página", default: "1" },
      // limit: { type: "string", description: "Elementos por página", default: "20" },
    },
  },
  response: {
    200: {
      description: "Lista de tareas",
      type: "object",
      properties: {
        tasks: { type: "array" },
        total: { type: "number" },
        // page: { type: "number" },
        // limit: { type: "number" },
        // totalPages: { type: "number" },
      },
    },
  },
};

const getTaskSchema = {
  description: "Obtener una tarea por ID",
  tags: ["Tasks"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["teamId", "id"],
    properties: {
      teamId: { type: "string", description: "ID del equipo" },
      id: { type: "string", description: "ID de la tarea" },
    },
  },
  response: {
    200: {
      description: "Tarea encontrada",
      type: "object",
      properties: {
        task: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            type: { type: "string" },
            status: { type: "string" },
            priority: { type: "string" },
            assigneeId: {
              type: "object",
              properties: {
                _id: { type: "string" },
                firstName: { type: "string" },
                lastName: { type: "string" },
                email: { type: "string" },
              },
            },
            reporterId: {
              type: "object",
              properties: {
                _id: { type: "string" },
                firstName: { type: "string" },
                lastName: { type: "string" },
                email: { type: "string" },
              },
            },
            teamId: { type: "string" },
            dueDate: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    404: {
      description: "Tarea no encontrada",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const updateTaskSchema = {
  description: "Actualizar una tarea",
  tags: ["Tasks"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["teamId", "id"],
    properties: {
      teamId: { type: "string", description: "ID del equipo" },
      id: { type: "string", description: "ID de la tarea" },
    },
  },
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título de la tarea" },
          description: {
            type: "string",
            description: "Descripción de la tarea",
          },
          priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            description: "Prioridad de la tarea",
          },
          assigneeId: { type: "string", description: "ID del responsable" },
          dueDate: {
            type: "string",
            description: "Fecha de vencimiento (ISO)",
          },
          type: {
            type: "string",
            enum: ["BUG", "FEAUTERE", "TASK"],
            description: "Tipo de tarea",
          },
        },
      },
    },
  },
  response: {
    200: {
      description: "Tarea actualizada exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        task: { type: "object" },
      },
    },
  },
};

const updateTaskStatusSchema = {
  description: "Actualizar el estado de una tarea",
  tags: ["Tasks"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["teamId", "id"],
    properties: {
      teamId: { type: "string", description: "ID del equipo" },
      id: { type: "string", description: "ID de la tarea" },
    },
  },
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
            description: "Nuevo estado de la tarea",
          },
        },
      },
    },
  },
  response: {
    200: {
      description: "Estado actualizado exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        task: { type: "object" },
      },
    },
    400: {
      description: "Transición de estado no válida",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const deleteTaskSchema = {
  description: "Eliminar una tarea",
  tags: ["Tasks"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["teamId", "id"],
    properties: {
      teamId: { type: "string", description: "ID del equipo" },
      id: { type: "string", description: "ID de la tarea" },
    },
  },
  response: {
    200: {
      description: "Tarea eliminada exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

const addCommentSchema = {
  description: "Agregar un comentario a una tarea",
  tags: ["Tasks"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["teamId", "id"],
    properties: {
      teamId: { type: "string", description: "ID del equipo" },
      id: { type: "string", description: "ID de la tarea" },
    },
  },
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", description: "Contenido del comentario" },
        },
      },
    },
  },
  response: {
    201: {
      description: "Comentario agregado exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        comment: { type: "object" },
      },
    },
  },
};

const listCommentsSchema = {
  description: "Listar comentarios de una tarea",
  tags: ["Tasks"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["teamId", "id"],
    properties: {
      teamId: { type: "string", description: "ID del equipo" },
      id: { type: "string", description: "ID de la tarea" },
    },
  },
  response: {
    200: {
      description: "Lista de comentarios",
      type: "object",
      properties: {
        comments: { type: "array" },
      },
    },
  },
};

const updateCommentSchema = {
  description: "Actualizar un comentario",
  tags: ["Tasks"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["teamId", "id", "commentId"],
    properties: {
      teamId: { type: "string", description: "ID del equipo" },
      id: { type: "string", description: "ID de la tarea" },
      commentId: { type: "string", description: "ID del comentario" },
    },
  },
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        required: ["content"],
        properties: {
          content: {
            type: "string",
            description: "Nuevo contenido del comentario",
          },
        },
      },
    },
  },
  response: {
    200: {
      description: "Comentario actualizado exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        comment: { type: "object" },
      },
    },
  },
};

const deleteCommentSchema = {
  description: "Eliminar un comentario",
  tags: ["Tasks"],
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["teamId", "id", "commentId"],
    properties: {
      teamId: { type: "string", description: "ID del equipo" },
      id: { type: "string", description: "ID de la tarea" },
      commentId: { type: "string", description: "ID del comentario" },
    },
  },
  response: {
    200: {
      description: "Comentario eliminado exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

export default async function taskRoutes(fastify: FastifyInstance) {
  fastify.post<CreateTaskRequest>(
    "/teams/:teamId/tasks",
    { preHandler: authenticate, schema: createTaskSchema },
    create,
  );
  fastify.get<ListTasksRequest>(
    "/teams/:teamId/tasks",
    { preHandler: authenticate, schema: listTasksSchema },
    list,
  );
  fastify.get<GetTaskRequest>(
    "/teams/:teamId/tasks/:id",
    { preHandler: authenticate, schema: getTaskSchema },
    getById,
  );
  fastify.put<UpdateTaskRequest>(
    "/teams/:teamId/tasks/:id",
    { preHandler: authenticate, schema: updateTaskSchema },
    update,
  );
  fastify.patch<UpdateTaskStatusRequest>(
    "/teams/:teamId/tasks/:id/status",
    { preHandler: authenticate, schema: updateTaskStatusSchema },
    updateStatus,
  );
  fastify.delete<GetTaskRequest>(
    "/teams/:teamId/tasks/:id",
    { preHandler: authenticate, schema: deleteTaskSchema },
    remove,
  );
  fastify.post<AddCommentRequest>(
    "/teams/:teamId/tasks/:id/comments",
    { preHandler: authenticate, schema: addCommentSchema },
    addCommentHandler,
  );
  fastify.get<GetTaskRequest>(
    "/teams/:teamId/tasks/:id/comments",
    { preHandler: authenticate, schema: listCommentsSchema },
    listComments,
  );
  fastify.put<UpdateCommentRequest>(
    "/teams/:teamId/tasks/:id/comments/:commentId",
    { preHandler: authenticate, schema: updateCommentSchema },
    updateCommentHandler,
  );
  fastify.delete<DeleteCommentRequest>(
    "/teams/:teamId/tasks/:id/comments/:commentId",
    { preHandler: authenticate, schema: deleteCommentSchema },
    removeComment,
  );
}

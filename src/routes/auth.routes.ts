import { FastifyInstance } from "fastify";
import {
  register,
  login,
  getProfile,
  codeGenerate,
  verifyCode,
  verifyMagicToken,
} from "../controllers/auth.controller";
import { authenticate, verifyVerificationToken } from "../middlewares/auth.middleware";
import { RegisterModel } from "../models/auth.model";
import { Request } from "../models/request.model";

const registerSchema = {
  description: "Registrar un nuevo usuario",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        required: ["firstName", "lastName", "password"],
        properties: {
          firstName: { type: "string", description: "Nombre del usuario" },
          lastName: { type: "string", description: "Apellido del usuario" },
          password: {
            type: "string",
            minLength: 6,
            description: "Contraseña (mín. 6 caracteres)",
          },
        },
      },
    },
  },
  response: {
    201: {
      description: "Usuario registrado exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
    400: {
      description: "Error de validación",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const loginSchema = {
  description: "Iniciar sesión",
  tags: ["Auth"],
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "Correo electrónico",
          },
          password: { type: "string", description: "Contraseña" },
        },
      },
    },
  },
  response: {
    200: {
      description: "Inicio de sesión exitoso",
      type: "object",
      properties: {
        message: { type: "string" },
        access_token: { type: "string" },
        refresh_token: { type: "string" },
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string" },
            role: { type: "string" },
          },
        },
      },
    },
    401: {
      description: "Credenciales inválidas",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const profileSchema = {
  description: "Obtener perfil del usuario autenticado",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      description: "Perfil del usuario",
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string" },
            role: { type: "string" },
          },
        },
      },
    },
    401: {
      description: "Token inválido o no proporcionado",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const requestCodeSchema = {
  description: "Enviar código de verificación al correo",
  tags: ["Auth"],
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
          },
        },
      },
    },
  },
  response: {
    200: {
      description: "Código enviado exitosamente",
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "Verification code sent successfully",
        },
        code: {
          type: "string",
        },
      },
    },
    400: {
      description: "El email ya está registrado",
      type: "object",
      properties: {
        error: {
          type: "string",
        },
      },
    },
    // 409: {
    //   description: "El email ya está registrado",
    //   type: "object",
    //   properties: {
    //     error: {
    //       type: "string",
    //       example: "Email already exists",
    //     },
    //   },
    // },
    // 429: {
    //   description: "Demasiadas solicitudes",
    //   type: "object",
    //   properties: {
    //     error: {
    //       type: "string",
    //       example: "Too many requests",
    //     },
    //   },
    // },
  },
};

const verifyCodeSchema = {
  description: "Verificar código de 6 dígitos",
  tags: ["Auth"],
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        required: ["email", "code"],
        properties: {
          email: {
            type: "string",
          },
          code: {
            type: "string",
          },
        },
      },
    },
  },
  response: {
    200: {
      description: "Codigo verificado exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        verification_token: { type: "string" },
      },
    },
    400: {
      description: "Error de validación o token inválido",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
    401: {
      description: "Credenciales inválidas",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const verifyMagicTokenSchema = {
  description: "Verificar token mágico para acceso directo",
  tags: ["Auth"],
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        required: ["magic_token"],
        properties: {
          magic_token: {
            type: "string",
            description: "Token mágico enviado por correo para acceso directo",
          },
        },
      },
    },
  },
  response: {
    200: {
      description: "Acceso exitoso con token mágico",
      type: "object",
      properties: {
        message: { type: "string" },
        access_token: { type: "string" },
        refresh_token: { type: "string" },
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string" },
            role: { type: "string" },
          },
        },
      },
    },
    400: {
      description: "Token mágico inválido o expirado",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
    401: {
      description: "Credenciales inválidas",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: Request<RegisterModel> }>("/auth/register", { preHandler: verifyVerificationToken, schema: registerSchema }, register);
  fastify.post("/auth/login", { schema: loginSchema }, login);
  fastify.post(
    "/auth/request-code",
    { schema: requestCodeSchema },
    codeGenerate,
  );
  fastify.post("/auth/verify-code", { schema: verifyCodeSchema }, verifyCode);
  fastify.post("/auth/verify-magic-token", { schema: verifyMagicTokenSchema }, verifyMagicToken);
  fastify.get(
    "/auth/profile",
    { schema: profileSchema, preHandler: authenticate },
    getProfile,
  );
}
import { FastifyInstance } from "fastify";
import {
  register,
  login,
  getProfile,
  codeGenerate,
  verifyCode,
  verifyMagicToken,
  checkEmail,
  magicLinkGenerate,
  refresh,
  editProfile,
  changeAvatar,
} from "../controllers/auth.controller";
import {
  authenticate,
  verifyVerificationToken,
} from "../middlewares/auth.middleware";
import { GoogleCallBack, GithubCallBack } from "../controllers/auth.controller";
import rateLimit from "@fastify/rate-limit";
import {
  CheckEmailRequest,
  CodeGenerateRequest,
  LoginRequest,
  MagicLinkGenerateRequest,
  RegisterRequest,
  VerifyCodeRequestType,
  VerifyMagicTokenRequest,
  RefreshTokenRequest,
  EditProfileRequest,
} from "../types/auth.types";

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
            avatar: { type: "string" },
            provider: { type: "string" },
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

const checkEmailSchema = {
  description: "Verificar si un email existe",
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
            format: "email",
            description: "Correo electrónico",
          },
        },
      },
    },
  },
  response: {
    200: {
      description: "Respuesta indicando si el email existe",
      type: "object",
      properties: {
        exists: { type: "boolean" },
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

const magicLinkGenerateSchema = {
  description: "Generar enlace mágico para acceso directo",
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
            format: "email",
            description: "Correo electrónico",
          },
        },
      },
    },
  },
  response: {
    200: {
      description: "Enlace mágico enviado exitosamente",
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

const refreshTokenSchema = {
  description: "Renovar access token usando refresh token",
  tags: ["Auth"],
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        required: ["refresh_token"],
        properties: {
          refresh_token: {
            type: "string",
            description: "Refresh token",
          },
        },
      },
    },
  },
  response: {
    200: {
      description: "Token renovado exitosamente",
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
      description: "Refresh token inválido o expirado",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const editProfileSchema = {
  description: "Actualizar nombre y apellido del perfil",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  body: {
    type: "object",
    required: ["data"],
    properties: {
      data: {
        type: "object",
        properties: {
          firstName: { type: "string", description: "Nuevo nombre" },
          lastName: { type: "string", description: "Nuevo apellido" },
        },
      },
    },
  },
  response: {
    200: {
      description: "Perfil actualizado exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        user: {
          type: "object",
          properties: {
            id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            avatar: { type: "string" },
            provider: { type: "string" },
            email: { type: "string" },
            role: { type: "string" },
          },
        },
      },
    },
    400: {
      description: "Error de validación",
      type: "object",
      properties: {
        error: { type: "string" },
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

const changeAvatarSchema = {
  description: "Cambiar avatar del usuario autenticado",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  consumes: ["multipart/form-data"],
  body: {
    type: "object",
    required: ["avatar"],
    properties: {
      avatar: {
        type: "string",
        format: "binary",
        description: "Archivo de imagen (jpeg, png, webp, gif – máx 5MB)",
      },
    },
  },
  response: {
    200: {
      description: "Avatar actualizado exitosamente",
      type: "object",
      properties: {
        message: { type: "string" },
        user: {
          type: "object",
          properties: {
            id:        { type: "string" },
            firstName: { type: "string" },
            lastName:  { type: "string" },
            avatar:    { type: "string" },
            provider:  { type: "string" },
            email:     { type: "string" },
            role:      { type: "string" },
          },
        },
      },
    },
    400: {
      description: "Error de validación o archivo inválido",
      type: "object",
      properties: { error: { type: "string" } },
    },
    401: {
      description: "Token inválido o no proporcionado",
      type: "object",
      properties: { error: { type: "string" } },
    },
  },
};

const googleCallbackSchema = {
  description: "Callback de autenticación con Google OAuth2",
  tags: ["Auth"],
  querystring: {
    type: "object",
    properties: {
      code: { type: "string", description: "Código de autorización de Google" },
      scope: { type: "string", description: "Scopes autorizados" },
      authuser: { type: "string", description: "Usuario de Google" },
      prompt: { type: "string", description: "Prompt de consentimiento" },
    },
    required: ["code"],
  },
  response: {
    302: {
      type: "string",
      description: "Redirección al frontend con tokens",
    },
  },
};

const githubCallbackSchema = {
  description: "Callback de autenticación con GitHub OAuth2",
  tags: ["Auth"],
  querystring: {
    type: "object",
    properties: {
      code: { type: "string", description: "Código de autorización de GitHub" },
      scope: { type: "string", description: "Scopes autorizados" },
    },
    required: ["code"],
  },
  response: {
    302: {
      type: "string",
      description: "Redirección al frontend con tokens",
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
  fastify.post<RegisterRequest>(
    "/auth/register",
    { preHandler: verifyVerificationToken, schema: registerSchema },
    register,
  );
  fastify.post<LoginRequest>(
    "/auth/login",
    {
      config: { rateLimit: { max: 3, timeWindow: "10 minutes" } },
      schema: loginSchema,
    },
    login,
  );
  fastify.post<CodeGenerateRequest>(
    "/auth/request-code",
    { schema: requestCodeSchema },
    codeGenerate,
  );
  fastify.post<CheckEmailRequest>(
    "/auth/check-email",
    { schema: checkEmailSchema },
    checkEmail,
  );
  fastify.post<MagicLinkGenerateRequest>(
    "/auth/magic-link-generate",
    { schema: magicLinkGenerateSchema },
    magicLinkGenerate,
  );
  fastify.post<VerifyCodeRequestType>(
    "/auth/verify-code",
    { schema: verifyCodeSchema },
    verifyCode,
  );
  fastify.post<RefreshTokenRequest>(
    "/auth/refresh",
    { schema: refreshTokenSchema },
    refresh,
  );
  fastify.post<VerifyMagicTokenRequest>(
    "/auth/verify-magic-token",
    { schema: verifyMagicTokenSchema },
    verifyMagicToken,
  );
  fastify.get(
    "/auth/profile",
    { schema: profileSchema, preHandler: authenticate },
    getProfile,
  );
  fastify.patch<EditProfileRequest>(
    "/auth/profile",
    { schema: editProfileSchema, preHandler: authenticate },
    editProfile,
  );
  fastify.post(
    "/auth/avatar",
    { schema: changeAvatarSchema, preHandler: authenticate, validatorCompiler: () => () => true, },
    changeAvatar,
  );
  fastify.get(
    "/auth/google/callback",
    { schema: googleCallbackSchema },
    GoogleCallBack,
  );
  fastify.get(
    "/auth/github/callback",
    { schema: githubCallbackSchema },
    GithubCallBack,
  );
}

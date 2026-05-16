import { FastifyInstance } from 'fastify';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const registerSchema = {
  description: 'Registrar un nuevo usuario',
  tags: ['Auth'],
  body: {
    type: 'object',
    required: ['firstName', 'lastName', 'email', 'password'],
    properties: {
      firstName: { type: 'string', description: 'Nombre del usuario' },
      lastName: { type: 'string', description: 'Apellido del usuario' },
      email: { type: 'string', format: 'email', description: 'Correo electrónico' },
      password: { type: 'string', minLength: 6, description: 'Contraseña (mín. 6 caracteres)' },
    },
  },
  response: {
    201: {
      description: 'Usuario registrado exitosamente',
      type: 'object',
      properties: {
        message: { type: 'string' },
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
    400: {
      description: 'Error de validación',
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

const loginSchema = {
  description: 'Iniciar sesión',
  tags: ['Auth'],
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', description: 'Correo electrónico' },
      password: { type: 'string', description: 'Contraseña' },
    },
  },
  response: {
    200: {
      description: 'Inicio de sesión exitoso',
      type: 'object',
      properties: {
        message: { type: 'string' },
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
    401: {
      description: 'Credenciales inválidas',
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

const profileSchema = {
  description: 'Obtener perfil del usuario autenticado',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  response: {
    200: {
      description: 'Perfil del usuario',
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
    401: {
      description: 'Token inválido o no proporcionado',
      type: 'object',
      properties: {
        error: { type: 'string' },
      },
    },
  },
};

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register', { schema: registerSchema }, register);
  fastify.post('/auth/login', { schema: loginSchema }, login);
  fastify.get('/auth/profile', { schema: profileSchema, preHandler: authenticate }, getProfile);
}

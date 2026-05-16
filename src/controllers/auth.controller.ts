import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'devpulse_secret_key_change_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'devpulse_refresh_secret_key_change_in_production';

function generateTokens(user: any) {
  const access_token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refresh_token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { access_token, refresh_token };
}

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { firstName, lastName, email, password } = request.body as any;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return reply.status(400).send({ error: 'El email ya está registrado' });
  }

  const user = new User({ firstName, lastName, email, password });
  await user.save();

  const tokens = generateTokens(user);

  return reply.status(201).send({
    message: 'Usuario registrado exitosamente',
    ...tokens,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = request.body as any;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return reply.status(401).send({ error: 'Credenciales inválidas' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return reply.status(401).send({ error: 'Credenciales inválidas' });
  }

  const tokens = generateTokens(user);

  return reply.send({
    message: 'Inicio de sesión exitoso',
    ...tokens,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
}

export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
  const { id } = (request as any).user;

  const user = await User.findById(id);
  if (!user) {
    return reply.status(404).send({ error: 'Usuario no encontrado' });
  }

  return reply.send({
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
}

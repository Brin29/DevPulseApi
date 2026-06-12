import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/token.utils";

interface VerificationPayload {
  email: string;
  verified: boolean;
  iat?: number;
  exp?: number;
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const rawCookie = request.cookies["access_token"];

  if (!rawCookie) {
    return reply.status(401).send({ error: "No autenticado" });
  }

  const { valid, value } = request.unsignCookie(rawCookie);
  if (!valid || !value) {
    return reply.status(401).send({ error: "Cookie inválida" });
  }

  try {
    const decoded = jwt.verify(value, JWT_SECRET);
    (request as any).user = decoded;
  } catch {
    return reply.status(401).send({ error: "Token inválido o expirado" });
  }
}

export async function verifyVerificationToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const rawCookie = request.cookies["verification_token"];

  if (!rawCookie) {
    return reply.status(401).send({ error: "Token de verificación requerido" });
  }

  const { valid, value } = request.unsignCookie(rawCookie);
  if (!valid || !value) {
    return reply.status(401).send({ error: "Cookie de verificación inválida" });
  }

  try {
    const decoded = jwt.verify(value, JWT_SECRET) as VerificationPayload;

    if (!decoded.email || !decoded.verified) {
      return reply
        .status(401)
        .send({ error: "Token de verificación malformado" });
    }

    (request as any).verification = decoded;
  } catch {
    return reply.status(401).send({ error: "Token de verificación inválido o expirado" });
  }
}
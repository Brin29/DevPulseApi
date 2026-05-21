import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "devpulse_secret_key_change_in_production";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (request as any).user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: "Token inválido o expirado" });
  }
}

export async function verifyVerificationToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({
      error: "Token requerido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    (request as any).verification = decoded;
  } catch {
    return reply.status(401).send({
      error: "Token inválido o expirado",
    });
  }
}

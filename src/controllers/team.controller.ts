import { FastifyRequest, FastifyReply } from "fastify";
import {
  CreateTeamRequest,
  UpdateTeamRequest,
  GetTeamRequest,
  InviteMemberRequest,
  AcceptInvitationRequest,
} from "../types/team.types";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  inviteMember,
  acceptInvitation,
  getTeamInvitations,
  cancelInvitation,
  deleteInvitation,
  getTeamMembers,
} from "../services/team.service";

export async function create(
  request: FastifyRequest<CreateTeamRequest>,
  reply: FastifyReply,
) {
  const { name, description, slug, logo } = request.body.data;
  const { id } = (request as any).user;

  const team = await createTeam(name, description, slug, logo, id);

  return reply.status(201).send({
    message: "Equipo creado exitosamente",
    team,
  });
}

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const { id } = (request as any).user;

  const teams = await getTeams(id);

  return reply.send({ teams });
}

export async function getById(
  request: FastifyRequest<GetTeamRequest>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const userId = (request as any).user.id;

  const team = await getTeamById(id, userId);

  return reply.send({ team });
}

export async function update(
  request: FastifyRequest<UpdateTeamRequest>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const userId = (request as any).user.id;
  const { name, description, slug, logo } = request.body.data;

  const team = await updateTeam(id, { name, slug, logo }, userId);

  return reply.send({
    message: "Equipo actualizado exitosamente",
    team,
  });
}

export async function remove(
  request: FastifyRequest<GetTeamRequest>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const userId = (request as any).user.id;

  await deleteTeam(id, userId);

  return reply.send({ message: "Equipo eliminado exitosamente" });
}

export async function invite(
  request: FastifyRequest<InviteMemberRequest>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const { email, role } = request.body.data;
  const userId = (request as any).user.id;

  const invitation = await inviteMember(id, email, role, userId);

  return reply.status(201).send({
    message: "Invitación enviada exitosamente",
    invitation,
  });
}

export async function accept(
  request: FastifyRequest<AcceptInvitationRequest>,
  reply: FastifyReply,
) {
  const { token } = request.params;
  const userId = (request as any).user.id;

  const result = await acceptInvitation(token, userId);

  return reply.send({
    message: "Invitación aceptada exitosamente",
    teamId: result.teamId,
  });
}

export async function listInvitations(
  request: FastifyRequest<GetTeamRequest & { Querystring: { page?: string; limit?: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const userId = (request as any).user.id;
  const page = parseInt(request.query.page || "1", 10);
  const limit = parseInt(request.query.limit || "10", 10);

  const result = await getTeamInvitations(id, userId, page, limit);

  return reply.send(result);
}

export async function listMembers(
  request: FastifyRequest<GetTeamRequest>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const userId = (request as any).user.id;

  const members = await getTeamMembers(id, userId);

  return reply.send({ members });
}

export async function cancel(
  request: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply,
) {
  const { token } = request.params;
  const userId = (request as any).user.id;

  const invitation = await cancelInvitation(token, userId);

  return reply.send({
    message: "Invitación cancelada exitosamente",
    invitation,
  });
}

export async function deleteInvt(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const userId = (request as any).user.id;

  const invitation = await deleteInvitation(id, userId);

  return reply.send({
    message: "Invitación cancelada exitosamente",
    invitation,
  });
}

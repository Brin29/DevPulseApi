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

export async function list(
  request: FastifyRequest,
  reply: FastifyReply,
) {
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
  request: FastifyRequest<GetTeamRequest>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const userId = (request as any).user.id;

  const invitations = await getTeamInvitations(id, userId);
  
  return reply.send({ invitations });
}

export async function cancel(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const { id } = request.params;
  const userId = (request as any).user.id;

  const invitation = await cancelInvitation(id, userId);

  return reply.send({
    message: "Invitación cancelada exitosamente",
    invitation,
  });
}

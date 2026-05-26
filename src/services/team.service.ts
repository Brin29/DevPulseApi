import { randomBytes } from "node:crypto";
import Team from "../schemas/team.schema";
import OrganizationMember from "../schemas/organizationMember.schema";
import Invitation from "../schemas/invitation.schema";
import User from "../schemas/user.schema";
import "../schemas/project.schema";
import { EmailService } from "../utils/email.utils";
import { env } from "../env";

export async function createTeam(
  name: string,
  description: string,
  slug: string,
  logo: string | undefined,
  ownerId: string,
) {
  const existing = await Team.findOne({ slug });
  if (existing) throw { status: 409, message: "El slug ya está en uso" };

  const team = new Team({ name, description, slug, logo, ownerId });
  await team.save();

  await OrganizationMember.create({
    teamId: team._id,
    userId: ownerId,
    role: "ADMIN",
  });

  return team;
}

export async function getTeams(userId: string) {
  const memberTeams = await OrganizationMember.find({ userId }).select(
    "teamId",
  );

  const teamIds = memberTeams.map((m) => m.teamId);

  const teams = await Team.find({ _id: { $in: teamIds } }).populate(
    "members projects",
  );

  return teams;
}

export async function getTeamById(teamId: string, userId: string) {
  const team = await Team.findById(teamId)
    .populate({
      path: "members",
      populate: {
        path: "userId",
        select: "firstName lastName email",
      },
    })
    .populate("projects");
  if (!team) throw { status: 404, message: "Equipo no encontrado" };

  const isMember = await OrganizationMember.findOne({
    teamId,
    userId,
  });
  if (!isMember) throw { status: 403, message: "No eres miembro de este equipo" };
  
  return team;
}

export async function updateTeam(
  teamId: string,
  data: { name?: string; slug?: string; logo?: string },
  userId: string,
) {
  const team = await Team.findById(teamId);
  if (!team) throw { status: 404, message: "Equipo no encontrado" };

  if (team.ownerId.toString() !== userId) {
    throw { status: 403, message: "Solo el propietario puede actualizar el equipo" };
  }

  if (data.slug && data.slug !== team.slug) {
    const existing = await Team.findOne({ slug: data.slug });
    if (existing) throw { status: 409, message: "El slug ya está en uso" };
  }

  Object.assign(team, data);
  await team.save();

  return team;
}

export async function deleteTeam(teamId: string, userId: string) {
  const team = await Team.findById(teamId);
  if (!team) throw { status: 404, message: "Equipo no encontrado" };

  if (team.ownerId.toString() !== userId) {
    throw { status: 403, message: "Solo el propietario puede eliminar el equipo" };
  }

  await Promise.all([
    OrganizationMember.deleteMany({ teamId }),
    Invitation.deleteMany({ teamId }),
    Team.findByIdAndDelete(teamId),
  ]);
}

export async function inviteMember(
  teamId: string,
  email: string,
  role: string | undefined,
  invitedByUserId: string,
) {
  const team = await Team.findById(teamId);
  if (!team) throw { status: 404, message: "Equipo no encontrado" };

  const inviter = await User.findById(invitedByUserId);
  if (!inviter) throw { status: 404, message: "Usuario no encontrado" };

  const memberRole = role;

  const targetUser = await User.findOne({ email });
  if (targetUser) {
    const alreadyMember = await OrganizationMember.findOne({
      teamId,
      userId: targetUser._id,
    });
    if (alreadyMember) {
      throw { status: 409, message: "El usuario ya es miembro del equipo" };
    }
  }

  const existingInvitation = await Invitation.findOne({
    teamId,
    email,
    status: "pending",
  });
  if (existingInvitation) {
    throw {
      status: 409,
      message: "Ya existe una invitación pendiente para este email",
    };
  }

  const token = randomBytes(32).toString("hex");

  const invitation = await Invitation.create({
    teamId,
    email,
    role: memberRole,
    token,
    status: "pending",
    invitedBy: invitedByUserId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const acceptUrl = `${env.FRONTEND_URL}/teams/invitations/${token}/accept`;

  await EmailService.sendTeamInvitationEmail(
    email,
    team.name,
    `${inviter.firstName} ${inviter.lastName}`,
    acceptUrl,
  );

  return invitation;
}

export async function acceptInvitation(token: string, userId: string) {
  const invitation = await Invitation.findOne({ token, status: "pending" });
  if (!invitation) {
    throw { status: 404, message: "Invitación no encontrada o ya expiró" };
  }

  if (invitation.expiresAt < new Date()) {
    invitation.status = "expired";
    await invitation.save();
    throw { status: 410, message: "La invitación ha expirado" };
  }

  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "Usuario no encontrado" };

  if (user.email !== invitation.email) {
    throw {
      status: 403,
      message: "Esta invitación no está dirigida a tu correo",
    };
  }

  await OrganizationMember.create({
    teamId: invitation.teamId,
    userId,
    role: invitation.role,
  });

  invitation.status = "accepted";
  await invitation.save();

  return { teamId: invitation.teamId };
}

export async function getTeamInvitations(teamId: string, userId: string) {
  const team = await Team.findById(teamId);
  if (!team) throw { status: 404, message: "Equipo no encontrado" };

  const member = await OrganizationMember.findOne({
    teamId,
    userId,
    role: { $in: ["Admin"] },
  });
  if (!member && team.ownerId.toString() !== userId) {
    throw {
      status: 403,
      message: "Solo administradores pueden ver las invitaciones",
    };
  }

  const invitations = await Invitation.find({ teamId }).sort({ createdAt: -1 });

  return invitations;
}

export async function cancelInvitation(invitationId: string, userId: string) {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) throw { status: 404, message: "Invitación no encontrada" };

  const team = await Team.findById(invitation.teamId);
  if (!team) throw { status: 404, message: "Equipo no encontrado" };

  const member = await OrganizationMember.findOne({
    teamId: invitation.teamId,
    userId,
    role: { $in: ["Admin"] },
  });
  if (!member && team.ownerId.toString() !== userId) {
    throw {
      status: 403,
      message: "No tienes permiso para cancelar esta invitación",
    };
  }

  invitation.status = "expired";
  await invitation.save();

  return invitation;
}

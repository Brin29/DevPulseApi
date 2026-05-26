import { Request } from "../models/request.model";

export interface CreateTeamRequest {
  Body: Request<{ name: string; description: string; slug: string; logo?: string }>;
}

export interface UpdateTeamRequest {
  Body: Request<{ name?: string; description: string; slug?: string; logo?: string }>;
  Params: { id: string };
}

export interface GetTeamRequest {
  Params: { id: string };
}

export interface InviteMemberRequest {
  Body: Request<{ email: string; role?: string }>;
  Params: { id: string };
}

export interface AcceptInvitationRequest {
  Params: { token: string };
}

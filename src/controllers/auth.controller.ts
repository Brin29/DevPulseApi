import { FastifyRequest, FastifyReply } from "fastify";
import User from "../schemas/user.schema";
import {
  RegisterRequest,
  LoginRequest,
  CodeGenerateRequest,
  VerifyCodeRequestType,
  CheckEmailRequest,
  MagicLinkGenerateRequest,
  VerifyMagicTokenRequest,
  RefreshTokenRequest,
  EditProfileRequest,
} from "../types/auth.types";
import {
  loginUser,
  registerUser,
  refreshUserToken,
  loginWithGoogle,
  loginWithGithub,
  editUserProfile,
  changeUserAvatar,
} from "../services/auth.service";
import {
  generateMagicLink,
  verifyMagicLink,
} from "../services/magicLink.service";
import {
  generateCode,
  verificationCode,
} from "../services/verificationCode.service";
import { env } from "../env";

export async function register(
  request: FastifyRequest<RegisterRequest>,
  reply: FastifyReply,
) {
  const verification = (request as any).verification;
  const { firstName, lastName, password } = request.body.data as any;

  const userData = {
    firstName,
    lastName,
    email: verification.email,
    password,
  };

  const { tokens, user } = await registerUser(userData);

  return reply.status(201).send({
    message: "Usuario registrado exitosamente",
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

export async function GithubCallBack(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { token } = await (
    request.server as any
  ).githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

  const githubResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });

  const githubUser = await githubResponse.json();

  const emailsResponse = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });

  const { tokens } = await loginWithGithub(githubUser);

  return reply.redirect(
    `${process.env.FRONTEND_URL}/oauth-success?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
  );
}

export async function GoogleCallBack(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { token } = await (
    request.server as any
  ).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    },
  );

  const googleUser = await response.json();

  const { tokens } = await loginWithGoogle(googleUser);

  return reply.redirect(
    `${env.FRONTEND_URL}/oauth-success?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
  );
}

export async function login(
  request: FastifyRequest<LoginRequest>,
  reply: FastifyReply,
) {
  const { email, password } = request.body.data;
  const { tokens, user } = await loginUser(email, password);

  return reply.send({
    message: "Inicio de sesión exitoso",
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

export async function checkEmail(
  request: FastifyRequest<CheckEmailRequest>,
  reply: FastifyReply,
) {
  const { email } = request.body.data;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return reply.status(200).send({
      exists: true,
    });
  } else {
    return reply.status(200).send({
      exists: false,
    });
  }
}

export async function magicLinkGenerate(
  request: FastifyRequest<MagicLinkGenerateRequest>,
  reply: FastifyReply,
) {
  const { email } = request.body.data;
  await generateMagicLink(email);

  return reply.status(200).send({
    message: "Se ha enviado un enlace de acceso a su correo electrónico",
  });
}

export async function codeGenerate(
  request: FastifyRequest<CodeGenerateRequest>,
  reply: FastifyReply,
) {
  const { email } = request.body.data;
  const { code } = await generateCode(email);

  return reply.status(200).send({
    code: code,
    message: "Codigo enviado exitosamente",
  });
}

export async function verifyCode(
  request: FastifyRequest<VerifyCodeRequestType>,
  reply: FastifyReply,
) {
  const { email, code } = request.body.data;
  const { verificationToken } = await verificationCode(email, code);

  return reply.status(200).send({
    message: "Código verificado exitosamente",
    verification_token: verificationToken,
  });
}

export async function refresh(
  request: FastifyRequest<RefreshTokenRequest>,
  reply: FastifyReply,
) {
  const { refresh_token } = request.body.data;
  const { tokens, user } = await refreshUserToken(refresh_token);

  return reply.send({
    message: "Token renovado exitosamente",
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

export async function verifyMagicToken(
  request: FastifyRequest<VerifyMagicTokenRequest>,
  reply: FastifyReply,
) {
  const { magic_token } = request.body.data;
  const { tokens, user } = await verifyMagicLink(magic_token);

  return reply.send({
    message: "Login exitoso",
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
    return reply.status(404).send({ error: "Usuario no encontrado" });
  }

  return reply.send({
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      provider: user.provider,
      email: user.email,
      role: user.role,
    },
  });
}

export async function editProfile(
  request: FastifyRequest<EditProfileRequest>,
  reply: FastifyReply,
) {
  const { id } = (request as any).user;
  const { firstName, lastName } = request.body.data;

  const { user } = await editUserProfile(id, firstName, lastName);

  return reply.send({
    message: "Perfil actualizado exitosamente",
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      provider: user.provider,
      email: user.email,
      role: user.role,
    },
  });
}

export async function changeAvatar(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = (request as any).user;
  const file = await request.file({ limits: { fileSize: 5 * 1024 * 1024 } });

  const buffer = file ? await file.toBuffer() : undefined;
  const mimeType = file?.mimetype;

  const { user } = await changeUserAvatar(id, buffer, mimeType);

  return reply.send({
    message: "Avatar actualizado exitosamente",
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      provider: user.provider,
      email: user.email,
      role: user.role,
    },
  });
}

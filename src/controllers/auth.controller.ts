import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import User from "../schemas/user.schema";
import {
  RegisterModel,
  LoginModel,
  
  CodeModel,
  VerifyCodeRequest,
} from "../models/auth.model";
import { Request } from "../models/request.model";
import VerificationToken from "../schemas/verificationToken.schema";
import { randomInt } from "node:crypto";
import { EmailService } from "../utils/email";

const JWT_SECRET =
  process.env.JWT_SECRET || "devpulse_secret_key_change_in_production";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "devpulse_refresh_secret_key_change_in_production";

function generateTokens(user: any) {
  const access_token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refresh_token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  return { access_token, refresh_token };
}

export async function codeGenerate(
  request: FastifyRequest<{ Body: Request<CodeModel> }>,
  reply: FastifyReply,
) {
  const { email } = request.body.data as any;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return reply.status(400).send({ error: "El email ya está registrado" });
  }

  await VerificationToken.deleteOne({
    email,
  });

  const code = randomInt(100000, 999999).toString();

  const verificationToken = new VerificationToken({
    email,
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await verificationToken.save();

  await EmailService.sendVerificationEmail(email, code);

  console.log(code);

  return reply.status(200).send({
    code: code,
    message: "Codigo enviado exitoste",
  });
}

export async function verifyCode(
  request: FastifyRequest<{ Body: Request<VerifyCodeRequest> }>,
  reply: FastifyReply,
) {
  const { email, code } = request.body.data as any;

  const verification = await VerificationToken.findOne({ email }).select(
    "+code",
  );

  if (!verification) {
    return reply.status(400).send({
      error: "Código no existe",
    });
  }

  if (verification.expiresAt < new Date()) {
    return reply.status(400).send({
      error: "Código expirado",
    });
  }

  const isValid = await verification.compareCode(code);

  if (!isValid) {
    return reply.status(400).send({
      error: "Código inválido",
    });
  }

  // Find verification token for this email
  const verificationToken = jwt.sign(
    {
      email,
      verified: true,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  return reply.status(200).send({
    message: "Código verificado exitosamente",
    verification_token: verificationToken,
  });
}

export async function register(
  request: FastifyRequest<{ Body: Request<RegisterModel> }>,
  reply: FastifyReply,
) {

  console.log("Mostrar verificacion:")
  const verification = (request as any).verification;
  const { firstName, lastName, password } = request.body.data as any;

  const existingUser = await User.findOne({ email: verification.email });

  if (existingUser) {
    // If user is verified, send a magic link for login
    if (existingUser.isVerified) {
      const magicToken = jwt.sign(
        { id: existingUser._id, email: existingUser.email },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const magicLink = `${frontendUrl}/login?magic_token=${magicToken}`;

      await EmailService.sendMagicLinkEmail(
        existingUser.email,
        magicLink,
        `${existingUser.firstName} ${existingUser.lastName}`
      );

      return reply.status(200).send({
        message: "Se ha enviado un enlace de acceso a su correo electrónico",
      });
    } else {
      // User exists but not verified
      return reply.status(400).send({
        error: "El email ya está registrado pero no verificado. Por favor verifique su correo primero.",
      });
    }
  }

  console.log("Mostrar verificacion:")
  console.log(verification)

  const user = new User({
    firstName,
    lastName,
    email: verification.email,
    password,
  });
  await user.save();

  // To-do: tal vez va en otra parte
  await VerificationToken.deleteOne({
    email: verification.email,
  });

  const tokens = generateTokens(user);

  return reply.status(201).send({
    message: "Usuario registrado exitosamente",
    // ...tokens,
    // user: {
    //   id: user._id,
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   email: user.email,
    //   role: user.role,
    // },
  });
}

export async function login(
  request: FastifyRequest<{ Body: Request<LoginModel> }>,
  reply: FastifyReply,
) {
  const { email, password } = request.body.data as any;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return reply.status(401).send({ error: "Credenciales inválidas" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return reply.status(401).send({ error: "Credenciales inválidas" });
  }

  const tokens = generateTokens(user);

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
      email: user.email,
      role: user.role,
    },
  });
}

export async function verifyMagicToken(
  request: FastifyRequest<{ Body: { magic_token: string } }>,
  reply: FastifyReply,
) {
  const { magic_token } = request.body;

  try {
    const decoded = jwt.verify(magic_token, JWT_SECRET) as {
      id: string;
      email: string;
    };

    const user = await User.findById(decoded.id);
    if (!user) {
      return reply.status(401).send({ error: "Usuario no encontrado" });
    }

    // Verify that the email in the token matches the user's email
    if (user.email !== decoded.email) {
      return reply.status(401).send({ error: "Token inválido" });
    }

    const tokens = generateTokens(user);

    return reply.send({
      message: "Acceso exitoso con token mágico",
      ...tokens,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return reply.status(401).send({ error: "Token mágico inválido o expirado" });
  }
}

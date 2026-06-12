import { randomBytes } from "node:crypto";
import User from "../schemas/user.schema";
import { generateTokens, verifyRefreshToken } from "../utils/token.utils";
import { OauthModel } from "../models/auth.model";
import { uploadAvatar } from "../utils/cloudinary.utils";

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw { status: 401, message: "Credenciales inválidas" };

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw { status: 401, message: "Credenciales inválidas" };

  return { tokens: generateTokens(user), user };
}

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const user = new User(data);
  await user.save();
  return { tokens: generateTokens(user), user };
}

export async function loginWithGoogle(googleUser: {
  email: string;
  given_name: string;
  family_name: string;
  picture: string;
}) {
  let user = await User.findOne({
    email: googleUser.email,
  });

  if (!user) {
    user = await User.create({
      firstName: googleUser.given_name,
      lastName: googleUser.family_name || "",
      email: googleUser.email,
      password: randomBytes(32).toString("hex"),
      provider: OauthModel.GOOGLE,
      avatar: googleUser.picture,
      isVerified: true,
    });
    
  }

  return { tokens: generateTokens(user), user };
}

export async function loginWithGithub(githubUser: any) {
  let user = await User.findOne({
    email: githubUser.login,
  });

  if (!user) {
    user = await User.create({
      firstName: githubUser.name || githubUser.login,
      lastName: "",
      email: githubUser.email ?? githubUser.login,
      password: randomBytes(32).toString("hex"),
      provider: OauthModel.GITHUB,
      avatar: githubUser.avatar_url,
      isVerified: true,
    });
  }

  return {
    tokens: generateTokens(user),
    user,
  };
}

export async function refreshUserToken(refresh_token: string) {
  let decoded: { id: string; email: string; role: string };
  try {
    decoded = verifyRefreshToken(refresh_token);
  } catch {
    throw { status: 401, message: "Refresh token inválido o expirado" };
  }

  const user = await User.findById(decoded.id);
  if (!user) throw { status: 401, message: "Usuario no encontrado" };

  return { tokens: generateTokens(user), user };
}

export async function getUserById(id: string) {
  const user = await User.findById(id);
  if (!user) throw { status: 404, message: "Usuario no encontrado" };
  return user;
}

export async function editUserProfile(
  userId: string,
  firstName?: string,
  lastName?: string,
) {
  if (!firstName && !lastName)
    throw {
      status: 400,
      message: "Debe proporcionar al menos un campo para actualizar",
    };

  const updateData: Record<string, string> = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

  if (!user) throw { status: 400, message: "Usuario no encontrado" };

  return { user };
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_SIZE_MB = 5;

export async function changeUserAvatar(
  userId: string,
  buffer?: Buffer,
  mimeType?: string,
) {
  if (!buffer || buffer.byteLength === 0)
    throw { status: 400, message: "Debe proporcionar una imagen" };

  if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType))
    throw {
      status: 400,
      message: `Formato no permitido. Formatos aceptados: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };

  const sizeMB = buffer.byteLength / (1024 * 1024);
  if (sizeMB > MAX_SIZE_MB)
    throw {
      status: 400,
      message: `La imagen no puede superar los ${MAX_SIZE_MB}MB`,
    };

  const { url } = await uploadAvatar(buffer, userId);

  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: url },
    { new: true },
  );

  if (!user) throw { status: 404, message: "Usuario no encontrado" };

  return { user };
}

import User from "../schemas/user.schema";
import {
  generateTokens,
  verifyRefreshToken,
} from "../utils/token.utils";

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
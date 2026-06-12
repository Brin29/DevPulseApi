import { createHash, randomBytes } from "node:crypto";
import MagicLink from "../schemas/magicLink.schema";
import User from "../schemas/user.schema";
import { generateTokens } from "../utils/token.utils";
import { EmailService } from "../utils/email.utils";
import { env } from "../env";

export async function generateMagicLink(email: string) {
  const existingUser = await User.findOne({ email });

  if (!existingUser) throw { status: 404, message: "Usuario no encontrado" };

  await MagicLink.deleteMany({
    userId: existingUser._id,
  });

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const magicLink = new MagicLink({
    userId: existingUser._id,
    token: tokenHash,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });

  await magicLink.save();

  const frontendUrl = env.FRONTEND_URL;
  const link = `${frontendUrl}/magic-login?token=${rawToken}`;

  await EmailService.sendMagicLinkEmail(
    existingUser.email,
    link,
    `${existingUser.firstName} ${existingUser.lastName}`,
  );
}

export async function verifyMagicLink(magicToken: string) {
  const tokenHash = createHash("sha256").update(magicToken).digest("hex");

  const magicLink = await MagicLink.findOne({
    token: tokenHash,
    used: false,
  });

  if (!magicLink) throw { status: 401, message: "Token inválido o expirado" };

  magicLink.used = true;
  await magicLink.save();

  const user = await User.findById(magicLink.userId);
  if (!user) throw { status: 404, message: "Usuario no encontrado" };

  return { tokens: generateTokens(user), user };
}

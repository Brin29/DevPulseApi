import { randomInt } from "node:crypto";
import jwt from "jsonwebtoken";
import User from "../schemas/user.schema";
import VerificationToken from "../schemas/verificationToken.schema";
import { EmailService } from "../utils/email.utils";
import { JWT_SECRET } from "../utils/token.utils";

export async function verificationCode(email: string, code: string) {
  const verification = await VerificationToken.findOne({ email }).select(
    "+code",
  );

  if (!verification) throw { statu: 400, message: "Código inválido o expirado." };

  if (verification.attempts >= 5) {
    await VerificationToken.deleteOne({
      email,
    });
    throw {
      status: 429,
      message: "Demasiados intentos. Solicita un nuevo código.",
    };
  }

  const isValid = await verification.compareCode(code);

  if (!isValid) {
    await VerificationToken.updateOne(
      { email },
      {
        $inc: {
          attempts: 1,
        },
      },
    );
    throw { status: 400, message: "Código inválido" };
  }

  await VerificationToken.deleteOne({
    email: verification.email,
  });

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

  return { verificationToken };
}

export async function generateCode(email: string) {
  const existingUser = await User.findOne({ email });
  if (existingUser)
    throw {
      status: 400,
      message: "Hubo un error el sistema no pudo generar el codigo",
    };

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

  return { code };
}

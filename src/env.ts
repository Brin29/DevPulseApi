import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  MAIL_HOST: process.env.MAIL_HOST!,
  MAIL_PORT: Number(process.env.MAIL_PORT),
  MONGO_URI: process.env.MONGO_URI,
  MAIL_USER: process.env.MAIL_USER!,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD!,
  FRONTEND_URL: process.env.FRONTEND_URL,
};
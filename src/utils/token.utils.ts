import jwt from "jsonwebtoken";

export const JWT_SECRET =
  process.env.JWT_SECRET || "devpulse_secret_key_change_in_production";
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "devpulse_refresh_secret_key_change_in_production";

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET) as {
    id: string;
    email: string;
    role: string;
  };
}

export function generateTokens(user: any) {
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
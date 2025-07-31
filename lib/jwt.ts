import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  email: string;
}

const JWT_SECRET =
  process.env.JWT_SECRET || "default-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (_: unknown) {
    throw new Error("Invalid or expired token");
  }
};

export const extractTokenFromHeader = (authHeader: string | null): string => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Invalid authorization header");
  }
  return authHeader.substring(7);
};

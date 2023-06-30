import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = "SUPER SECRET";

type AuthRequest = Request & { user?: User };

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  // decode a jwt token
  try {
    const payload = (await jwt.verify(token, JWT_SECRET)) as {
      tokenId: number;
    };
    const dbToken = await prisma.token.findUnique({
      where: { id: payload.tokenId },
      include: { user: true },
    });
    if (!dbToken?.valid || dbToken.expiration < new Date()) {
      return res.status(401).json({ error: "Api token expired!" });
    }
    req.user = dbToken.user;
  } catch (e: any) {
    return res.sendStatus(401);
  }
  next();
};

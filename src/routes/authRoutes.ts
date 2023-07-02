import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { EMAIL_TEMPLATE } from "../utils/email_template";
import send_mail from "../utils/mail";

const router = Router();
const prisma = new PrismaClient();
const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const API_EXPIRATION_AUTHENTICATIO_HOUR = 12;
const JWT_SECRET = "SUPER SECRET";



// Generate a random 8 digit number token as emailToken
function generateEmailToken(): string {
  return Math.floor(10000000 + Math.random() * 900000000).toString();
}

// Generate auth token
function generateAuthToken(tokenId: number): string {
  const payload = { tokenId };
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    noTimestamp: true,
  });
}

// Create a user if it doesn't exist
// generate a emailToken and send it to their email
router.post("/login", async (req, res) => {
  const { email } = req.body;
  const emailToken = generateEmailToken();
  const expiration = new Date(
    new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000
  );
  // create token
  try {
    const createToken = await prisma.token.create({
      data: {
        type: "EMAIL",
        emailToken,
        expiration,
        user: {
          connectOrCreate: {
            where: { email },
            create: { email },
          },
        },
      },
    });
    // send emailToken to user's email

    const options = {
      from: "aliahadi.f1105@gmail.com", // sender address
      to: email, // receiver email
      subject: "Your one-time password", // Subject line
      text: emailToken,
      html: EMAIL_TEMPLATE(emailToken),
    };

    await send_mail(options, (info: any) => {
      console.log("Email sent successfully");
      console.log("MESSAGE ID: ", info.messageId);
    });

    // const mailOptions = {
    //   from: "aliahadi.f1105@gmail.com",
    //   to: email,
    //   subject: "Send password verification",
    //   text: EMAIL_TEMPLATE(emailToken.toString()),
    // };

    // // @ts-ignore
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Email sent: " + info);
    //   }
    // });

    res.sendStatus(200);
  } catch (e: any) {
    res
      .status(400)
      .json({ error: "Couldn't start the authentication process" });
  }
});

// Validate a email token
// Generate a long-lived JWT token
router.post("/authenticate", async (req, res) => {
  const { email, emailToken } = req.body;
  const dbEmailToken = await prisma.token.findUnique({
    where: { emailToken },
    include: { user: true },
  });
  if (!dbEmailToken || !dbEmailToken.valid) {
    return res.sendStatus(401);
  }
  if (dbEmailToken.expiration < new Date()) {
    return res.status(401).json({ error: "Token expired!" });
  }
  if (dbEmailToken?.user?.email !== email) {
    return res.sendStatus(401);
  }

  // ensure a emailToken send to the current email
  // generate API token
  const expiration = new Date(
    new Date().getTime() + API_EXPIRATION_AUTHENTICATIO_HOUR * 60 * 60 * 1000
  );

  const apiToken = await prisma.token.create({
    data: {
      type: "API",
      expiration,
      user: {
        connect: { email },
      },
    },
  });

  // Invalidate a email
  await prisma.token.update({
    where: { id: dbEmailToken.id },
    data: { valid: false },
  });

  // Generate a JWT token
  const authToken = generateAuthToken(apiToken.id);

  res.json({ authToken });
});

export default router;

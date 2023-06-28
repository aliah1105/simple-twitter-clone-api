import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all users
router.get("/", async (req, res) => {
  const allUsers = await prisma.user.findMany();
  res.status(200).json(allUsers);
});

// Get user by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  res.status(200).json(user);
});

// Create user
router.post("/", async (req, res) => {
  try {
    const { email, name, username } = req.body;
    const result = await prisma.user.create({
      data: {
        email,
        name,
        username,
        bio: "Hello I'm new on Twitter",
      },
    });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: "username and email must be unique" });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  const { bio, name, image } = req.body;
  const { id } = req.params;
  try {
    const result = await prisma.user.update({
      where: { id: Number(id) },
      data: { bio, name, image },
    });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: "Faild to update a user" });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    res.sendStatus(200);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;

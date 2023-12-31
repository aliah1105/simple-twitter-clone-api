import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = "SUPER SECRET";

// Create tweet
router.post("/", async (req, res) => {
  const { content, image } = req.body;
  // @ts-ignore
  const user = req.user;
  try {
    const userTweet = await prisma.tweet.create({
      data: { content, image, userId: user.id },
    });
    res.json(userTweet);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Get all tweets
router.get("/", async (req, res) => {
  try {
    const allTweets = await prisma.tweet.findMany({
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
      },
    });
    if (allTweets.length == 0) {
      return res.status(404).json({ error: "There is no tweets" });
    }
    res.json(allTweets);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Get a single tweet
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const tweet = await prisma.tweet.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });
    if (!tweet) {
      return res.status(404).json({ error: "Tweet is not found" });
    }
    res.json(tweet);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Update tweet
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { content, image, userId } = req.body;
  try {
    const tweet = await prisma.tweet.findUnique({ where: { id: Number(id) } });
    if (!tweet) {
      return res.status(404).json({ error: "Tweet is not found" });
    }
    if (tweet.userId !== Number(userId)) {
      return res.status(400).json({ error: "You can only update your tweets" });
    }
    const result = await prisma.tweet.update({
      where: { id: Number(id) },
      data: { content, image },
    });
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: "Failed to update tweet" });
  }
});

// Delete tweet
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const tweet = await prisma.tweet.findUnique({ where: { id: Number(id) } });
    if (!tweet) {
      return res.status(404).json({ error: "Tweet is not found" });
    }
    if (tweet?.userId !== Number(userId)) {
      return res.status(400).json({ error: "You can only delete your tweets" });
    }
    await prisma.tweet.delete({ where: { id: Number(id) } });
    res.sendStatus(200);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;

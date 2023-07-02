import express from "express";
import userRoutes from "./routes/userRoutes";
import tweetRoutes from "./routes/tweetRoutes";
import authRoutes from "./routes/authRoutes";
import { authMiddleware } from "./middlewares/auth";

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/tweet", authMiddleware, tweetRoutes);
app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

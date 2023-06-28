import express from "express";
import userRoutes from "./routes/userRoutes";
import tweetRoutes from "./routes/tweetRoutes";

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/tweet", tweetRoutes);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

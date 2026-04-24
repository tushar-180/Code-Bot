import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes";
import aiRoutes from "./routes/ai.routes";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("API running...");
});

app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);

// Error Handler Middleware
app.use(errorHandler);

export default app;

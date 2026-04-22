import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.routes";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("API running...");
});

app.use("/api/chat", chatRoutes);

export default app;

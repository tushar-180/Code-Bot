import { Request, Response } from "express";
import { AIServiceFactory } from "../services/ai/ai.factory";

export const getAvailableProviders = (req: Request, res: Response) => {
  try {
    const providers = AIServiceFactory.getAvailableProviders();
    return res.json({ providers });
  } catch (error) {
    console.error("Error fetching AI providers:", error);
    return res.status(500).json({ error: "Failed to fetch AI providers" });
  }
};

import { Request, Response } from "express";
import { Chat, ChatMessage } from "../models/Chat.model";
import {
  GeminiServiceError,
  generateResponse,
} from "../services/gemini.service";

const handleChatError = (
  error: unknown,
  res: Response,
  fallbackMessage: string,
) => {
  console.error(fallbackMessage, error);

  if (error instanceof GeminiServiceError) {
    return res.status(error.status).json({
      error: error.message,
      retryAfter: error.retryAfter,
    });
  }

  return res.status(500).json({ error: fallbackMessage });
};

// Create new chat
export const createChat = async (req: Request, res: Response) => {
  try {
    const { userId, message } = req.body as {
      userId?: string;
      message?: string;
    };

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const trimmedMessage = message?.trim();
    const messages: ChatMessage[] = [];

    if (trimmedMessage) {
      messages.push({ role: "user", content: trimmedMessage });

      const reply = await generateResponse(messages);
      messages.push({ role: "assistant", content: reply });
    }

    const chat = new Chat({
      userId,
      title: trimmedMessage ? trimmedMessage.slice(0, 30) : "New Chat",
      messages,
    });

    await chat.save();

    return res.json(chat);
  } catch (error) {
    return handleChatError(error, res, "Failed to create chat");
  }
};

// Add message to existing chat
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body as { message?: string };
    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      return res.status(400).json({ error: "message is required" });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    chat.messages.push({ role: "user", content: trimmedMessage });

    if (!chat.title || chat.title === "New Chat") {
      chat.title = trimmedMessage.slice(0, 30);
    }

    const reply = await generateResponse(chat.messages as ChatMessage[]);

    chat.messages.push({ role: "assistant", content: reply });

    await chat.save();

    return res.json(chat);
  } catch (error) {
    console.log("Error in sendMessage:", error);
    return handleChatError(error, res, "Failed to send message");
  }
};

// Get All Chats
export const getAllChats = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });

    return res.json(chats);
  } catch (error) {
    console.error("Error fetching chats", error);
    return res.status(500).json({ error: "Failed to fetch chats" });
  }
};

// get single chat
export const getChatById = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    return res.json(chat);
  } catch (error) {
    console.error("Error fetching chat", error);
    return res.status(500).json({ error: "Failed to fetch chat" });
  }
};

// Delete chat
export const deleteChat = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    return res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    return handleChatError(error, res, "Failed to delete chat");
  }
};

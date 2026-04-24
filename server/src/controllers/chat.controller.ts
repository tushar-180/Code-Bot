import { Request, Response } from "express";
import { Chat, ChatMessage } from "../models/Chat.model";
import { AIServiceFactory } from "../services/ai/ai.factory";
import { asyncHandler } from "../utils/asyncHandler";
const MAX_HISTORY_MESSAGES = 10;

const getLimitedMessages = (messages: ChatMessage[]): ChatMessage[] => {
  return messages.slice(-MAX_HISTORY_MESSAGES);
};



const writeSse = (res: Response, payload: unknown) => {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  (res as Response & { flush?: () => void }).flush?.();
};

const splitAndWriteChunk = async (res: Response, chunk: string) => {
  // If the chunk is very large, split it into smaller pieces (approximately word-by-word)
  // to ensure a smooth streaming experience even if the model sends blocks of text.
  if (chunk.length > 25) {
    const parts = chunk.split(/(\s+)/); // Split by words/spaces and keep the delimiters
    for (const part of parts) {
      if (part) {
        writeSse(res, { chunk: part });
        // Add a tiny artificial delay to ensure the client receives separate packets
        // and the streaming animation has room to breathe.
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
    }
  } else {
    writeSse(res, { chunk });
  }
};

// Create new chat
export const createChat = asyncHandler(async (req: Request, res: Response) => {
  const { userId, message, provider } = req.body as {
    userId?: string;
    message?: string;
    provider?: string;
  };
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const trimmedMessage = message?.trim();
  const messages: ChatMessage[] = [];

  if (trimmedMessage) {
    messages.push({
      role: "user",
      content: trimmedMessage,
      model: provider || "gemini",
    });

    const aiProvider = AIServiceFactory.getProvider(provider);
    const providerName = aiProvider.getProviderName();
    const reply = await aiProvider.generateResponse(
      getLimitedMessages(messages),
    );
    messages.push({ role: "assistant", content: reply, model: providerName });
  }

  const chat = new Chat({
    userId,
    title: trimmedMessage ? trimmedMessage.slice(0, 30) : "New Chat",
    messages,
  });

  await chat.save();

  return res.json(chat);
});

// Create new chat with streaming
export const createChatStream = async (req: Request, res: Response) => {
  try {
    const { userId, message, provider } = req.body as {
      userId?: string;
      message?: string;
      provider?: string;
    };

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const trimmedMessage = message?.trim();
    if (!trimmedMessage) {
      return res
        .status(400)
        .json({ error: "message is required for streaming creation" });
    }

    const chat = new Chat({
      userId,
      title: trimmedMessage.slice(0, 30),
      messages: [
        { role: "user", content: trimmedMessage, model: provider || "gemini" },
      ],
    });

    // Save chat with user message FIRST
    await chat.save();

    // Send headers for SSE
    res.setHeader("Content-Type", "text/event-stream"); // Server-Sent Events
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.socket?.setNoDelay(true);
    res.flushHeaders?.();

    // Send the chatId and model name immediately so the frontend knows it's created
    const aiProvider = AIServiceFactory.getProvider(provider);
    const providerName = aiProvider.getProviderName();
    writeSse(res, { chatId: chat._id, model: providerName });

    try {
      const aiProvider = AIServiceFactory.getProvider(provider);
      const stream = aiProvider.generateStreamResponse(
        getLimitedMessages(chat.messages as ChatMessage[]),
      );

      let fullResponse = "";

      for await (const chunk of stream) {
        fullResponse += chunk;
        await splitAndWriteChunk(res, chunk);
      }

      chat.messages.push({
        role: "assistant",
        content: fullResponse,
        model: providerName,
      } as any);
      await chat.save();

      writeSse(res, { done: true, chatId: chat._id }); // end streaming
      res.end();
    } catch (aiError) {
      console.error("AI Error in createChatStream:", aiError);
      writeSse(res, {
        error: "AI failed to respond, but your message was saved.",
      });
      res.end();
    }
  } catch (error) {
    console.log("Error in createChatStream:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to create chat stream" });
    }
    res.end();
  }
};

// Add message to existing chat
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { message, provider } = req.body as {
    message?: string;
    provider?: string;
  };
  const trimmedMessage = message?.trim();

  if (!trimmedMessage) {
    return res.status(400).json({ error: "message is required" });
  }

  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    return res.status(404).json({ error: "Chat not found" });
  }

  chat.messages.push({
    role: "user",
    content: trimmedMessage,
    model: provider || "gemini",
  } as any);

  if (!chat.title || chat.title === "New Chat") {
    chat.title = trimmedMessage.slice(0, 30);
  }

  const aiProvider = AIServiceFactory.getProvider(provider);
  const providerName = aiProvider.getProviderName();
  const reply = await aiProvider.generateResponse(
    getLimitedMessages(chat.messages as ChatMessage[]),
  );

  chat.messages.push({
    role: "assistant",
    content: reply,
    model: providerName,
  } as any);

  await chat.save();

  return res.json(chat);
});

// Get All Chats
export const getAllChats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const chats = await Chat.find({ userId })
    .select("-messages")
    .sort({ updatedAt: -1 });

  return res.json(chats);
});

// get single chat
export const getChatById = asyncHandler(async (req: Request, res: Response) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    return res.status(404).json({ error: "Chat not found" });
  }

  // const rawLimit = Number.parseInt(String(req.query.limit ?? ""), 10);
  // const rawBefore = Number.parseInt(String(req.query.before ?? ""), 10);
  // const limit = Number.isNaN(rawLimit)
  //   ? DEFAULT_MESSAGES_PAGE_SIZE
  //   : rawLimit;
  // const before = Number.isNaN(rawBefore) ? undefined : rawBefore;

  // const chatObject = chat.toObject();
  // const page = getMessagesPage(chatObject.messages as ChatMessage[], limit, before);

  // return res.json({
  //   ...chatObject,
  //   messages: page.messages,
  //   pagination: page.pagination,
  // });
  return res.json(chat);
});

// Add message to existing chat with streaming
export const streamMessage = async (req: Request, res: Response) => {
  try {
    const { message, provider } = req.body as {
      message?: string;
      provider?: string;
    };
    const trimmedMessage = message?.trim();

    if (!trimmedMessage) {
      return res.status(400).json({ error: "message is required" });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    chat.messages.push({
      role: "user",
      content: trimmedMessage,
      model: provider || "gemini",
    } as any);

    if (!chat.title || chat.title === "New Chat") {
      chat.title = trimmedMessage.slice(0, 30);
    }

    // Save chat with user message FIRST
    await chat.save();

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.socket?.setNoDelay(true);
    res.flushHeaders?.();

    try {
      const aiProvider = AIServiceFactory.getProvider(provider);
      const providerName = aiProvider.getProviderName();
      writeSse(res, { model: providerName });
      const stream = aiProvider.generateStreamResponse(
        getLimitedMessages(chat.messages as ChatMessage[]),
      );

      let fullResponse = "";

      for await (const chunk of stream) {
        fullResponse += chunk;
        await splitAndWriteChunk(res, chunk);
      }

      chat.messages.push({
        role: "assistant",
        content: fullResponse,
        model: providerName,
      } as any);
      await chat.save();

      writeSse(res, { done: true, chatId: chat._id });
      res.end();
    } catch (aiError) {
      console.error("AI Error in streamMessage:", aiError);
      writeSse(res, {
        error: "AI failed to respond, but your message was saved.",
      });
      res.end();
    }
  } catch (error) {
    console.log("Error in streamMessage:", error);
    if (!res.headersSent) {
      // Manual error handling for streaming setup phase
      res.status(500).json({ error: "Failed to initiate stream" });
    }
    res.end();
  }
};

// Delete chat
export const deleteChat = asyncHandler(async (req: Request, res: Response) => {
  const chat = await Chat.findByIdAndDelete(req.params.id);

  if (!chat) {
    return res.status(404).json({ error: "Chat not found" });
  }

  return res.json({ message: "Chat deleted successfully" });
});

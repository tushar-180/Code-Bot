import { Router } from "express";
import * as ChatController from "../controllers/chat.controller";

const router = Router();

// Create new chat
router.post("/", ChatController.createChat);

// Add message to existing chat
router.post("/:id", ChatController.sendMessage);

// Get All Chats
router.get("/", ChatController.getAllChats);

// Get single chat
router.get("/:id", ChatController.getChatById);

// Delete chat
router.delete("/:id", ChatController.deleteChat);

export default router;

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { NvidiaAdapter } from "./services/ai/providers/nvidia.adapter";

async function test() {
  console.log("Testing NVIDIA NIM Adapter...");
  const adapter = new NvidiaAdapter();
  
  const messages = [
    { role: "user" as const, content: "Hello! Who are you?" }
  ];

  try {
    console.log("\n--- Testing Streaming ---");
    const stream = adapter.generateStreamResponse(messages);
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
    console.log("\n\n--- Streaming Done ---");

    console.log("\n--- Testing Single Response ---");
    const response = await adapter.generateResponse(messages);
    console.log("Response:", response);
    
    console.log("\nTest passed!");
  } catch (error) {
    console.error("\nTest failed:", error);
  }
}

test();

import { google } from "@ai-sdk/google";
import { type CoreMessage, generateText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    console.log("Received body:", body);

    if (!body) {
      return Response.json({ error: "No request body" }, { status: 400 });
    }

    const { messages } = JSON.parse(body) as { messages: CoreMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      messages,
    });

    return Response.json({
      messages: [
        {
          role: "assistant" as const,
          content: result.text,
        },
      ],
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return Response.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}

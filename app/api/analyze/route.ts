import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { nbaCardSchema } from "@/lib/schema";
import { NBA_CARD_ANALYSIS_PROMPT } from "@/lib/prompts";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { images } = await req.json();

    if (!images || images.length === 0) {
      return new Response("No images provided", { status: 400 });
    }

    // Images are already base64 data URLs from the client
    const imageContents = images.map((imageDataUrl: string) => ({
      type: "image" as const,
      image: imageDataUrl,
    }));

    const result = streamObject({
      model: google("gemini-2.5-flash"),
      schema: nbaCardSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze ALL ${images.length} image(s). First validate if each image contains a PSA-graded NBA card, then extract information for valid cards. Return ${images.length} card object(s) in the cards array.`,
            },
            ...imageContents,
          ],
        },
      ],
      system: NBA_CARD_ANALYSIS_PROMPT,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error analyzing card:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze card",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

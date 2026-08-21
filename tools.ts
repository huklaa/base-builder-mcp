import OpenAI from "openai";
import { getGuideParams } from "./params.js";
import { z } from "zod";

export const getGuide = async ({
  guideLink,
}: z.infer<typeof getGuideParams>) => {
  console.error("Received request for guide:", guideLink);
  try {
    // Remove the base URL prefix and ensure the path starts correctly
    const guidePath = guideLink.replace("https://docs.base.org", "");
    const githubRawUrl = `https://raw.githubusercontent.com/base/web/refs/heads/master/apps/base-docs/docs/pages${guidePath}.mdx`;
    console.error("Fetching from URL:", githubRawUrl);

    const response = await fetch(githubRawUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch guide: ${response.statusText}`);
    }
    const guide = await response.text();
    console.error("Successfully fetched guide content");

    let finalResult = guide;

    if (process.env.OPENAI_API_KEY) {
      const client = new OpenAI();
      // Process the guide content with GPT-4
      console.error("Processing with ChatGPT...");
      const result = await client.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "developer",
            content:
              "convert this guide into a structured JSON of actions, including all steps and gotchas:\n\n" +
              guide,
          },
        ],
      });
      finalResult = result.output_text;
      console.error("Successfully processed guide content");
    }

    return {
      content: [
        {
          type: "text" as const,
          text: finalResult,
        },
      ],
    };
  } catch (err) {
    const error = err as Error;
    console.error("Error processing guide:", error.message);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${error.message}`,
        },
      ],
    };
  }
};

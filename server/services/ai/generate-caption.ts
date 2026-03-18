import OpenAI from "openai";
import {
  buildCaptionSystemPrompt,
  buildCaptionUserPrompt,
  type CaptionPromptInput,
} from "./prompt-builder";
import type { AiCaptionOutput } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_CAPTION_MODEL ?? "gpt-4o-mini";

export async function generateCaption(
  input: CaptionPromptInput
): Promise<AiCaptionOutput> {
  const systemPrompt = buildCaptionSystemPrompt();
  const userPrompt = buildCaptionUserPrompt(input);

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI");

  const parsed = parseCaptionResponse(content);
  return parsed;
}

function parseCaptionResponse(content: string): AiCaptionOutput {
  try {
    const cleaned = content.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const obj = JSON.parse(cleaned) as Record<string, unknown>;

    const mainCaption = typeof obj.mainCaption === "string" ? obj.mainCaption : "";
    if (!mainCaption) throw new Error("Missing mainCaption");

    return {
      title: typeof obj.title === "string" ? obj.title : undefined,
      mainCaption,
      shortCaption:
        typeof obj.shortCaption === "string" ? obj.shortCaption : undefined,
      cta: typeof obj.cta === "string" ? obj.cta : undefined,
      hashtags: Array.isArray(obj.hashtags)
        ? (obj.hashtags as string[]).filter((h) => typeof h === "string")
        : undefined,
      platformNotes:
        typeof obj.platformNotes === "string" ? obj.platformNotes : undefined,
      confidenceNotes:
        typeof obj.confidenceNotes === "string"
          ? obj.confidenceNotes
          : undefined,
    };
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error("AI returned invalid JSON. Please try again.");
    }
    throw e;
  }
}

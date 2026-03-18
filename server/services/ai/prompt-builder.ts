import type { BrandProfile, MediaAsset } from "@prisma/client";
import type { Platform } from "@prisma/client";

export interface CaptionPromptInput {
  brandProfile: BrandProfile | null;
  mediaNotes: string;
  mediaTags: string[];
  platform: Platform;
  captionLength?: "short" | "long";
  postingGoal?: string;
  tone?: string;
  ctaPreference?: string;
  campaignObjective?: string;
}

export function buildCaptionSystemPrompt(): string {
  return `You are a social media copywriter. You generate captions and metadata for social media posts that match the brand's voice and goals. Output valid JSON only, no markdown or extra text.`;
}

export function buildCaptionUserPrompt(input: CaptionPromptInput): string {
  const {
    brandProfile,
    mediaNotes,
    mediaTags,
    platform,
    captionLength,
    postingGoal,
    tone,
    ctaPreference,
    campaignObjective,
  } = input;

  const parts: string[] = [];

  parts.push("Generate a social media post for the following context.");
  parts.push("");

  if (brandProfile) {
    parts.push("## Brand profile");
    if (brandProfile.shortDescription)
      parts.push(`Short description: ${brandProfile.shortDescription}`);
    if (brandProfile.longDescription)
      parts.push(`About: ${brandProfile.longDescription}`);
    if (brandProfile.targetAudience)
      parts.push(`Target audience: ${brandProfile.targetAudience}`);
    if (brandProfile.toneOfVoice)
      parts.push(`Tone of voice: ${brandProfile.toneOfVoice}`);
    if (brandProfile.mainGoals)
      parts.push(`Main goals: ${brandProfile.mainGoals}`);
    if (brandProfile.productsServices)
      parts.push(`Products/Services: ${brandProfile.productsServices}`);
    if (brandProfile.hashtags)
      parts.push(`Hashtags/themes: ${brandProfile.hashtags}`);
    if (brandProfile.ctaStyle)
      parts.push(`CTA style: ${brandProfile.ctaStyle}`);
    parts.push("");
  }

  parts.push("## Media context");
  if (mediaNotes) parts.push(`Notes: ${mediaNotes}`);
  if (mediaTags.length) parts.push(`Tags: ${mediaTags.join(", ")}`);
  parts.push("");

  parts.push(`## Platform: ${platform}`);
  if (postingGoal) parts.push(`Posting goal: ${postingGoal}`);
  if (tone) parts.push(`Tone for this post: ${tone}`);
  if (ctaPreference) parts.push(`CTA preference: ${ctaPreference}`);
  if (campaignObjective) parts.push(`Campaign: ${campaignObjective}`);
  parts.push("");

  const length = captionLength ?? "short";
  const mainCaptionGuide =
    length === "long"
      ? "Write a long-form caption (roughly 800-1500 characters), with clear structure (hook, value, CTA)."
      : "Write a short caption (roughly 120-280 characters). Keep it punchy and scannable.";

  parts.push(`Respond with a single JSON object with these exact keys:
- title (optional string): optional headline/title
- mainCaption (string): ${mainCaptionGuide}
- shortCaption (string): shorter variant (e.g. for Twitter/X or first line)
- cta (string): call-to-action phrase
- hashtags (array of strings): 3-8 relevant hashtags
- platformNotes (optional string): brief note on style for this platform
- confidenceNotes (optional string): optional note on tone match or suggestions`);

  return parts.join("\n");
}

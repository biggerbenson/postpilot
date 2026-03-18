import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { assertWorkspaceAccess } from "@/server/services/workspace";
import { generateCaption } from "@/server/services/ai/generate-caption";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { Platform } from "@prisma/client";
import { getEntitlements, incrementAiGeneration } from "@/lib/subscriptions/service";
import { canRegenerate, canUseLongCaptions } from "@/lib/subscriptions/gating";

const bodySchema = z.object({
  workspaceId: z.string(),
  mediaId: z.string(),
  platform: z.enum(["INSTAGRAM", "FACEBOOK", "LINKEDIN", "X", "TIKTOK"]),
  captionLength: z.enum(["short", "long"]).optional(),
  regenerate: z.boolean().optional(),
  postingGoal: z.string().optional(),
  tone: z.string().optional(),
  ctaPreference: z.string().optional(),
  campaignObjective: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const {
    workspaceId,
    mediaId,
    platform,
    captionLength,
    regenerate,
    postingGoal,
    tone,
    ctaPreference,
    campaignObjective,
  } =
    parsed.data;

  try {
    await assertWorkspaceAccess(workspaceId, user.id);
  } catch {
    return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
  }

  const [workspace, media] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { brandProfile: true },
    }),
    prisma.mediaAsset.findFirst({
      where: { id: mediaId, workspaceId },
    }),
  ]);

  if (!workspace) return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
  if (!media) return NextResponse.json({ message: "Media not found" }, { status: 404 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { message: "AI generation is not configured" },
      { status: 503 }
    );
  }

  try {
    const entitlements = await getEntitlements(user.id);

    // Enforce caption length gating
    if (captionLength === "long") {
      const gate = canUseLongCaptions(entitlements);
      if (!gate.ok) return NextResponse.json(gate, { status: 402 });
    }

    // Enforce regeneration gating (counts as another AI generation)
    if (regenerate) {
      const gate = canRegenerate(entitlements);
      if (!gate.ok) return NextResponse.json(gate, { status: 402 });
    }

    // Enforce monthly AI usage limit (+ increment)
    const usageResult = await incrementAiGeneration(user.id, {
      isRegeneration: Boolean(regenerate),
    });
    if (!usageResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          code: "UPGRADE_REQUIRED",
          message: "You have reached your monthly AI generation limit. Upgrade to continue.",
          currentPlan: usageResult.sub.plan,
          requiredPlan: usageResult.sub.plan === "FREE" ? "STARTER" : "PRO",
          reason: "ai_limit",
        },
        { status: 402 }
      );
    }

    const notes = [media.altCaption, media.campaignNotes].filter(Boolean).join(". ");
    const result = await generateCaption({
      brandProfile: workspace.brandProfile ?? null,
      mediaNotes: notes,
      mediaTags: media.tags,
      platform: platform as Platform,
      captionLength: captionLength ?? "short",
      postingGoal,
      tone: tone ?? workspace.brandProfile?.toneOfVoice ?? undefined,
      ctaPreference: ctaPreference ?? workspace.brandProfile?.ctaStyle ?? undefined,
      campaignObjective,
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}

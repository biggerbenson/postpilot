"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createWorkspaceWithProfileSchema,
  type CreateWorkspaceWithProfileSchema,
} from "@/lib/validations/workspace";
import { useToast } from "@/components/ui/use-toast";
import type { Workspace, BrandProfile } from "@prisma/client";

type WorkspaceWithBrand = Workspace & { brandProfile: BrandProfile | null };

const defaultBrand = {
  businessType: "",
  shortDescription: "",
  longDescription: "",
  targetAudience: "",
  toneOfVoice: "",
  mainGoals: "",
  productsServices: "",
  website: "",
  location: "",
  hashtags: "",
  keywordThemes: "",
  preferredPostingStyle: "",
  postingFrequency: "",
  postingDays: "",
  preferredTimes: "",
  ctaStyle: "",
};

export function WorkspaceForm({ workspace }: { workspace?: WorkspaceWithBrand }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showBrand, setShowBrand] = useState(!!workspace?.brandProfile);

  const brandProfile = workspace?.brandProfile;
  const defaultValues: CreateWorkspaceWithProfileSchema = {
    name: workspace?.name ?? "",
    slug: workspace?.slug ?? undefined,
    brand: {
      ...defaultBrand,
      ...(brandProfile && {
        businessType: brandProfile.businessType ?? "",
        shortDescription: brandProfile.shortDescription ?? "",
        longDescription: brandProfile.longDescription ?? "",
        targetAudience: brandProfile.targetAudience ?? "",
        toneOfVoice: brandProfile.toneOfVoice ?? "",
        mainGoals: brandProfile.mainGoals ?? "",
        productsServices: brandProfile.productsServices ?? "",
        website: brandProfile.website ?? "",
        location: brandProfile.location ?? "",
        hashtags: brandProfile.hashtags ?? "",
        keywordThemes: brandProfile.keywordThemes ?? "",
        preferredPostingStyle: brandProfile.preferredPostingStyle ?? "",
        postingFrequency: brandProfile.postingFrequency ?? "",
        postingDays: brandProfile.postingDays ?? "",
        preferredTimes: brandProfile.preferredTimes ?? "",
        ctaStyle: brandProfile.ctaStyle ?? "",
      }),
    },
  };

  const form = useForm<CreateWorkspaceWithProfileSchema>({
    resolver: zodResolver(createWorkspaceWithProfileSchema),
    defaultValues,
  });

  async function onSubmit(data: CreateWorkspaceWithProfileSchema) {
    setIsLoading(true);
    try {
      const url = workspace ? `/api/workspaces/${workspace.id}` : "/api/workspaces";
      const method = workspace ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug || undefined,
          brand: showBrand ? data.brand : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          title: "Error",
          description: json.message ?? "Something went wrong",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: workspace ? "Workspace updated" : "Workspace created",
        variant: "success",
      });
      router.push(workspace ? `/workspaces/${workspace.id}` : "/workspaces");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic info</CardTitle>
          <CardDescription>Workspace name and identifier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="My Brand"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (optional)</Label>
            <Input
              id="slug"
              {...form.register("slug")}
              placeholder="my-brand"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Brand profile</CardTitle>
            <CardDescription>
              Used for AI caption generation and posting style
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowBrand(!showBrand)}
          >
            {showBrand ? "Hide" : "Show"}
          </Button>
        </CardHeader>
        {showBrand && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Business type / industry</Label>
                <Input
                  {...form.register("brand.businessType")}
                  placeholder="e.g. E-commerce, SaaS"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  {...form.register("brand.website")}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Short description</Label>
              <Input
                {...form.register("brand.shortDescription")}
                placeholder="One-line tagline"
              />
            </div>
            <div className="space-y-2">
              <Label>Long description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...form.register("brand.longDescription")}
                placeholder="About your brand..."
              />
            </div>
            <div className="space-y-2">
              <Label>Target audience</Label>
              <Input
                {...form.register("brand.targetAudience")}
                placeholder="e.g. Small business owners, 25-40"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tone of voice</Label>
                <Input
                  {...form.register("brand.toneOfVoice")}
                  placeholder="e.g. Professional, friendly"
                />
              </div>
              <div className="space-y-2">
                <Label>Main goals</Label>
                <Input
                  {...form.register("brand.mainGoals")}
                  placeholder="Sales, awareness, engagement"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Products / services</Label>
              <Input
                {...form.register("brand.productsServices")}
                placeholder="What you offer"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                {...form.register("brand.location")}
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label>Hashtags / keyword themes</Label>
              <Input
                {...form.register("brand.hashtags")}
                placeholder="#brand #industry"
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred posting style</Label>
              <Input
                {...form.register("brand.preferredPostingStyle")}
                placeholder="e.g. Short punchy, storytelling"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Posting frequency</Label>
                <Input
                  {...form.register("brand.postingFrequency")}
                  placeholder="e.g. Daily, 3x/week"
                />
              </div>
              <div className="space-y-2">
                <Label>Posting days</Label>
                <Input
                  {...form.register("brand.postingDays")}
                  placeholder="e.g. Mon, Wed, Fri"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preferred times (comma or JSON)</Label>
              <Input
                {...form.register("brand.preferredTimes")}
                placeholder='e.g. 09:00, 14:00 or ["09:00","14:00"]'
              />
            </div>
            <div className="space-y-2">
              <Label>CTA style</Label>
              <Input
                {...form.register("brand.ctaStyle")}
                placeholder="e.g. Learn more, Shop now"
              />
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : workspace ? "Update workspace" : "Create workspace"}
        </Button>
        {workspace && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/workspaces")}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

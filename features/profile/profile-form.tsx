"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, updatePasswordSchema } from "@/lib/validations/profile";
import type {
  UpdateProfileInput,
  UpdatePasswordInput,
} from "@/lib/validations/profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

type ProfileInitial = {
  email: string;
  name: string | null;
  displayName: string | null;
  phone: string | null;
};

const emptyInitial: ProfileInitial = {
  email: "",
  name: null,
  displayName: null,
  phone: null,
};

export function ProfileForm({ initial }: { initial: ProfileInitial }) {
  const { toast } = useToast();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const safeInitial = initial ?? emptyInitial;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      email: safeInitial.email ?? "",
      name: safeInitial.name ?? "",
      displayName: safeInitial.displayName ?? "",
      phone: safeInitial.phone ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  async function onSubmitProfile(data: UpdateProfileInput) {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          name: data.name || null,
          displayName: data.displayName || null,
          phone: data.phone || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          title: "Error",
          description: json.message ?? "Failed to update profile",
          variant: "destructive",
        });
        return;
      }
      reset({
        email: json.email,
        name: json.name ?? "",
        displayName: json.displayName ?? "",
        phone: json.phone ?? "",
      });
      toast({
        title: "Profile updated",
        description: "Your profile details have been saved.",
        variant: "success",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSubmitPassword(data: UpdatePasswordInput) {
    setSavingPassword(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast({
          title: "Error",
          description:
            json.message ?? "Failed to update password",
          variant: "destructive",
        });
        return;
      }
      resetPassword({ currentPassword: "", newPassword: "" });
      toast({
        title: "Password updated",
        description:
          "Your password has been changed successfully.",
        variant: "success",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={handleSubmit(onSubmitProfile)}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                {...register("displayName")}
                placeholder="What other users see"
              />
              {errors.displayName && (
                <p className="text-sm text-destructive">
                  {errors.displayName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Your name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+1 234 567 890"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save profile"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>

      <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password. You&apos;ll use this to sign in with
              email/password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...registerPassword("currentPassword")}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...registerPassword("newPassword")}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}


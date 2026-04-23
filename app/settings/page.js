"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUiPreferences, setUiPreferences } from "@/app/lib/uiPreferences";
import {
  Bell,
  Bookmark,
  Cog,
  FilePenLine,
  Moon,
  Save,
  Shield,
  Sparkles,
  Users,
  LogOut,
  Loader2,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import toast, { Toaster } from "react-hot-toast";
import { useActionLock } from "@/app/lib/useActionLock";

const DEFAULT_SETTINGS = {
  profileVisibility: "public",
  allowComments: true,
  showProfileDetails: true,
  likeNotifications: true,
  commentNotifications: true,
  followNotifications: true,
  emailDigest: false,
  compactMode: false,
  hideMediaPreviews: false,
};

function normalizeSettings(preferences = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...preferences,
  };
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-gray-950">{label}</p>
        <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    </label>
  );
}

export default function SettingsPage() {
  const { signOut } = useClerk();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { run, isBusy, activeKey } = useActionLock(700);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/profile");
        if (!mounted) return;
        setProfile(response.data.profile);
        setSettings(normalizeSettings({
          ...response.data.profile?.preferences,
          ...getUiPreferences(),
        }));
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Could not load settings right now.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = async () => {
    await run("save-settings", async () => {
      const response = await axios.patch("/api/profile", {
        settings,
      });
      setUiPreferences({
        compactMode: settings.compactMode,
        hideMediaPreviews: settings.hideMediaPreviews,
      });
      setProfile(response.data?.profile);
      toast.success("Settings saved.");
    }).catch((error) => {
      console.error("Failed to save settings:", error);
      toast.error(error?.response?.data?.message || "Failed to save settings.");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <ProfileNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <section className="border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-7 md:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <Avatar className="h-24 w-24 border border-gray-200 bg-gray-100">
                  <AvatarImage src={profile?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-gray-900 text-2xl font-semibold text-white">
                    {(profile?.username || "S").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                    Settings
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
                    Account and preferences
                  </h1>
                  <p className="mt-1 text-base text-gray-500">
                    Control how your profile behaves, what readers can do, and how the app feels.
                  </p>
                  <p className="mt-5 max-w-2xl border-l-2 border-gray-200 pl-4 text-base leading-7 text-gray-700">
                    These settings are saved with your profile so they stay in sync across the app.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/editprofile"
                  className="inline-flex h-10 items-center gap-2 border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50"
                >
                  <FilePenLine className="h-4 w-4" />
                  Edit profile
                </Link>
                <Button
                  onClick={saveSettings}
                  disabled={isBusy}
                  className="h-10 bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {activeKey === "save-settings" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {activeKey === "save-settings" ? "Saving..." : "Save settings"}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <section className="border border-gray-200 bg-white p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Cog className="h-4 w-4 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-950">Profile visibility</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Visibility</label>
                    <select
                      value={settings.profileVisibility}
                      onChange={(event) => updateSetting("profileVisibility", event.target.value)}
                      className="h-11 w-full border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <Toggle
                    label="Allow comments"
                    description="Let readers comment on your posts."
                    checked={settings.allowComments}
                    onChange={(value) => updateSetting("allowComments", value)}
                  />
                  <Toggle
                    label="Show profile & website details"
                    description="Display profile details and website information on your main profile when this is enabled."
                    checked={settings.showProfileDetails}
                    onChange={(value) => updateSetting("showProfileDetails", value)}
                  />
                </div>
              </section>

              <section className="border border-gray-200 bg-white p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-950">Notifications</h2>
                </div>
                <div className="space-y-4">
                  <Toggle
                    label="Like notifications"
                    description="Get notified when people like your posts."
                    checked={settings.likeNotifications}
                    onChange={(value) => updateSetting("likeNotifications", value)}
                  />
                  <Toggle
                    label="Comment notifications"
                    description="Get notified about replies and comments."
                    checked={settings.commentNotifications}
                    onChange={(value) => updateSetting("commentNotifications", value)}
                  />
                  <Toggle
                    label="Follow notifications"
                    description="Get notified when someone starts following you."
                    checked={settings.followNotifications}
                    onChange={(value) => updateSetting("followNotifications", value)}
                  />
                  <Toggle
                    label="Weekly email digest"
                    description="Receive a small weekly summary of activity."
                    checked={settings.emailDigest}
                    onChange={(value) => updateSetting("emailDigest", value)}
                  />
                </div>
              </section>

              <section className="border border-gray-200 bg-white p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Moon className="h-4 w-4 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-950">Interface</h2>
                </div>
                <Toggle
                  label="Compact reading mode"
                  description="Use a denser layout for feeds and cards."
                  checked={settings.compactMode}
                  onChange={(value) => updateSetting("compactMode", value)}
                />
                <Toggle
                  label="Hide media previews"
                  description="Show text-first cards without large cover images."
                  checked={settings.hideMediaPreviews}
                  onChange={(value) => updateSetting("hideMediaPreviews", value)}
                />
              </section>
            </div>

            <aside className="space-y-4">
              <section className="border border-gray-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Quick actions
                </p>
                <div className="mt-5 space-y-3">
                  <Link
                    href="/profile"
                    className="flex items-center justify-between border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Open profile
                    <Users className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/editprofile"
                    className="flex items-center justify-between border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Edit details
                    <Shield className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/bookmarks"
                    className="flex items-center justify-between border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Saved posts
                    <Bookmark className="h-4 w-4" />
                  </Link>
                </div>
              </section>

              <section className="border border-gray-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Session
                </p>
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  type="button"
                  className="mt-5 flex w-full items-center justify-between border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Sign out
                  <LogOut className="h-4 w-4" />
                </button>
              </section>
            </aside>
          </div>
        </section>
      </main>
      <Toaster />
    </div>
  );
}

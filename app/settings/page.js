"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Loader2,
  LogOut,
  Moon,
  Save,
  Shield,
  Users,
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
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-4 transition hover:border-slate-500 hover:bg-slate-800/90">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 rounded border-slate-600 text-white focus:ring-white"
      />
    </label>
  );
}

function SummaryCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 p-4 shadow-[0_18px_42px_rgba(2,6,23,0.28)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-black tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs leading-5 text-slate-400">{hint}</p> : null}
    </div>
  );
}

export default function SettingsPage() {
  const { signOut } = useClerk();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [initialSettings, setInitialSettings] = useState(DEFAULT_SETTINGS);
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
        const nextSettings = normalizeSettings({
          ...response.data.profile?.preferences,
          ...getUiPreferences(),
        });
        setSettings(nextSettings);
        setInitialSettings(nextSettings);
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
      setInitialSettings(settings);
      toast.success("Settings saved.");
    }).catch((error) => {
      console.error("Failed to save settings:", error);
      toast.error(error?.response?.data?.message || "Failed to save settings.");
    });
  };

  const summaryCards = useMemo(
    () => [
      { label: "Visibility", value: settings.profileVisibility || "public", hint: "Public or private profile mode." },
      { label: "Comments", value: settings.allowComments ? "On" : "Off", hint: "Controls post comment access." },
      { label: "Interface", value: settings.compactMode ? "Compact" : "Comfort", hint: "Feed density and spacing." },
      { label: "Media", value: settings.hideMediaPreviews ? "Hidden" : "Shown", hint: "Cover image previews in cards." },
    ],
    [settings]
  );

  const isDirty = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [settings, initialSettings]);

  return (
    <div className="app-page">
      <ProfileNav />
      <main className="app-shell">
        {loading ? (
          <section className="app-panel p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="h-8 w-44 rounded-full bg-slate-800" />
                <div className="h-12 w-3/4 rounded-2xl bg-slate-800" />
                <div className="h-20 rounded-2xl bg-slate-800" />
              </div>
              <div className="h-56 rounded-3xl bg-slate-800" />
            </div>
          </section>
        ) : (
          <section className="app-panel overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="border-b border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 px-6 py-8 text-white md:px-8 md:py-10 lg:border-b-0 lg:border-r">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <Avatar className="h-24 w-24 border border-slate-700/80 bg-slate-900 shadow-[0_0_0_6px_rgba(15,23,42,0.6)]">
                      <AvatarImage src={profile?.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-slate-800 text-2xl font-semibold text-white">
                        {(profile?.username || "S").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="max-w-2xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                        Settings
                      </p>
                      <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                        Account control center
                      </h1>
                      <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                        Fine-tune your profile, privacy, and reading experience from one calm, focused place.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                      <SummaryCard key={card.label} {...card} />
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                        isDirty
                          ? "border-white/15 bg-white text-slate-950"
                          : "border-slate-700/80 bg-slate-900 text-slate-300"
                      }`}
                    >
                      {isDirty ? "Unsaved changes" : "All changes saved"}
                    </span>
                    <Link
                      href="/profile"
                      className="app-action-secondary border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                    >
                      <Users className="h-4 w-4" />
                      Open profile
                    </Link>
                    <Link
                      href="/editprofile"
                      className="app-action-secondary border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                    >
                      <FilePenLine className="h-4 w-4" />
                      Edit profile
                    </Link>
                    <Button
                      onClick={saveSettings}
                      disabled={isBusy || !isDirty}
                      className="app-action-primary bg-white text-slate-950 hover:bg-slate-100"
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

              <div className="space-y-6 p-6 md:p-8">
                <section className="app-section">
                  <div className="mb-5 flex items-center gap-2">
                    <Cog className="h-4 w-4 text-white" />
                    <h2 className="text-lg font-black text-white">Profile and privacy</h2>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Profile visibility
                      </label>
                      <select
                        value={settings.profileVisibility}
                        onChange={(event) => updateSetting("profileVisibility", event.target.value)}
                        className="h-11 w-full rounded-2xl border border-slate-700/80 bg-slate-950 px-3 text-sm text-slate-100 outline-none transition focus:border-white"
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
                      label="Show profile and website details"
                      description="Display profile type, website, location, and joined date on your profile."
                      checked={settings.showProfileDetails}
                      onChange={(value) => updateSetting("showProfileDetails", value)}
                    />
                  </div>
                </section>

                <section className="app-section">
                  <div className="mb-5 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-white" />
                    <h2 className="text-lg font-black text-white">Notifications</h2>
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

                <section className="app-section">
                  <div className="mb-5 flex items-center gap-2">
                    <Moon className="h-4 w-4 text-white" />
                    <h2 className="text-lg font-black text-white">Interface</h2>
                  </div>
                  <div className="space-y-4">
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
                  </div>
                </section>
              </div>
            </div>

            <div className="border-t border-slate-800/80 bg-slate-950/90 px-6 py-6 md:px-8">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-900/90 p-5 shadow-[0_18px_42px_rgba(2,6,23,0.28)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Edit profile
                    </p>
                    <Link
                      href="/editprofile"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-slate-300"
                    >
                      Open profile editor
                      <FilePenLine className="h-4 w-4" />
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Update your name, username, bio, avatar, and contact info here.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-800/80 bg-slate-900/90 p-5 shadow-[0_18px_42px_rgba(2,6,23,0.28)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Current state
                    </p>
                    <p className="mt-3 text-lg font-black tracking-tight text-white">
                      {profile?.FirstName || profile?.username || "Your profile"}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      @{profile?.username || "username"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {settings.profileVisibility === "private" ? "Private profile mode is active." : "Public profile mode is active."}
                    </p>
                  </div>
                </div>

                <aside className="space-y-4">
                  <section className="app-section">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Quick links
                    </p>
                    <div className="mt-4 grid gap-3">
                      <Link
                        href="/profile"
                        className="flex items-center justify-between rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                      >
                        Open profile
                        <Users className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/bookmarks"
                        className="flex items-center justify-between rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                      >
                        Saved posts
                        <Bookmark className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/follow-requests"
                        className="flex items-center justify-between rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                      >
                        Follow requests
                        <Shield className="h-4 w-4" />
                      </Link>
                    </div>
                  </section>

                  <section className="app-section">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Session
                    </p>
                    <button
                      onClick={() => signOut({ redirectUrl: "/" })}
                      type="button"
                      className="mt-4 inline-flex h-11 w-full items-center justify-between rounded-full border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                    >
                      Sign out
                      <LogOut className="h-4 w-4" />
                    </button>
                  </section>
                </aside>
              </div>
            </div>
          </section>
        )}
      </main>
      {!loading ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/80 bg-slate-950/95 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                {isDirty ? "Unsaved changes" : "Saved"}
              </p>
              <p className="truncate text-sm text-slate-300">
                {isDirty ? "Tap save to publish your latest settings." : "Your settings are up to date."}
              </p>
            </div>
            <Button
              onClick={saveSettings}
              disabled={isBusy || !isDirty}
              className="app-action-primary h-11 shrink-0 px-4"
            >
              {activeKey === "save-settings" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </div>
      ) : null}
      <Toaster />
    </div>
  );
}

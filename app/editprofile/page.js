"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2, Loader2, Save, Shield, Sparkles, UserRound } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { normalizeUsername } from "@/app/lib/username";

const DEFAULT_FORM = {
  username: "",
  FirstName: "",
  LastName: "",
  Bio: "",
  website: "",
  location: "",
  profileType: "Personal",
  gender: "Male",
  dob: "",
  mobile: "",
  profileImageUrl: "",
};

function formatJoinDate(dateValue) {
  if (!dateValue) return "Recently joined";
  return new Date(dateValue).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function normalizeProfile(profile = {}) {
  return {
    ...DEFAULT_FORM,
    username: profile.username || "",
    FirstName: profile.FirstName || "",
    LastName: profile.LastName || "",
    Bio: profile.Bio || "",
    website: profile.website || "",
    location: profile.location || "",
    profileType: profile.profileType || "Personal",
    gender: profile.gender || "Male",
    dob: profile.dob || "",
    mobile: profile.mobile || "",
    profileImageUrl: profile.profileImageUrl || "",
  };
}

export default function EditProfilePage() {
  const router = useRouter();
  const usernameCheckTimer = useRef(null);
  const usernameCheckRequestId = useRef(0);
  const initialUsernameRef = useRef("");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [profileMeta, setProfileMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [usernameStatus, setUsernameStatus] = useState({
    state: "idle",
    message: "Enter a username to check availability.",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/profile");
        if (!isMounted) return;
        setProfileMeta(response.data.profile);
        setForm(normalizeProfile(response.data.profile));
        initialUsernameRef.current = normalizeUsername(response.data.profile?.username) || "";
        setUsernameStatus({
          state: "current",
          message: "This is your current username.",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (isMounted) {
          setError("We could not load your profile right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "username" ? normalizeUsername(value) : value,
    }));
  };

  useEffect(() => {
    if (loading) return;

    const rawUsername = form.username || "";
    const trimmedUsername = normalizeUsername(rawUsername);

    if (usernameCheckTimer.current) {
      clearTimeout(usernameCheckTimer.current);
      usernameCheckTimer.current = null;
    }

    if (!trimmedUsername) {
      usernameCheckRequestId.current += 1;
      setUsernameStatus({
        state: "invalid",
        message: "Username cannot be empty.",
      });
      return;
    }

    if (trimmedUsername === initialUsernameRef.current) {
      usernameCheckRequestId.current += 1;
      setUsernameStatus({
        state: "current",
        message: "This is your current username.",
      });
      return;
    }

    const requestId = ++usernameCheckRequestId.current;
    setUsernameStatus({
      state: "checking",
      message: "Checking username availability...",
    });

    usernameCheckTimer.current = setTimeout(async () => {
      try {
        const response = await axios.get("/api/profile/username-check", {
          params: { username: trimmedUsername },
        });

        if (requestId !== usernameCheckRequestId.current) return;

        setUsernameStatus({
          state: response.data?.available ? "available" : "taken",
          message: response.data?.message || "Username availability checked.",
        });
      } catch (err) {
        if (requestId !== usernameCheckRequestId.current) return;

        setUsernameStatus({
          state: "error",
          message: err?.response?.data?.message || "We could not verify this username right now.",
        });
      }
    }, 450);

    return () => {
      if (usernameCheckTimer.current) {
        clearTimeout(usernameCheckTimer.current);
        usernameCheckTimer.current = null;
      }
      usernameCheckRequestId.current += 1;
    };
  }, [form.username, loading]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (usernameStatus.state === "checking") {
      toast.error("Checking username availability.");
      return;
    }

    if (usernameStatus.state === "taken") {
      toast.error("That username is already taken.");
      return;
    }

    const normalizedUsername = normalizeUsername(form.username);
    if (!normalizedUsername) {
      toast.error("Username cannot be empty.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await axios.patch("/api/profile", {
        profileData: {
          ...form,
          username: normalizedUsername,
        },
      });
      toast.success(response.data?.message || "Profile updated successfully.");
      router.push("/profile");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err?.response?.data?.message || "Failed to update profile.");
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const avatarInitial = useMemo(() => {
    return (form.username || "U").charAt(0).toUpperCase();
  }, [form.username]);

  const usernameStatusClasses = {
    idle: "text-gray-500",
    current: "text-blue-600",
    checking: "text-gray-500",
    available: "text-emerald-600",
    taken: "text-red-600",
    invalid: "text-amber-600",
    error: "text-red-600",
  };

  const UsernameStatusIcon = {
    current: CheckCircle2,
    available: CheckCircle2,
    taken: AlertCircle,
    invalid: AlertCircle,
    error: AlertCircle,
  }[usernameStatus.state];

  return (
    <div className="app-page">
      <ProfileNav />
      <main className="app-shell">
        {loading ? (
          <section className="app-panel p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-5">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-3">
                  <Skeleton className="h-8 w-56" />
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-72" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16" />
              ))}
            </div>
          </section>
        ) : error && !profileMeta ? (
          <section className="app-panel p-8 text-center">
            <h1 className="text-2xl font-black text-slate-950">Edit profile</h1>
            <p className="mt-3 text-slate-600">{error}</p>
                <Link
              href="/profile"
              className="mt-6 inline-flex h-10 items-center bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to profile
            </Link>
          </section>
        ) : (
            <section className="app-panel">
            <div className="border-b border-slate-100 px-6 py-7 md:px-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <Avatar className="h-24 w-24 border border-gray-200 bg-gray-100">
                    <AvatarImage src={form.profileImageUrl || profileMeta?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-gray-900 text-2xl font-semibold text-white">
                      {avatarInitial}
                    </AvatarFallback>
                  </Avatar>

                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                      Edit profile
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
                      {form.FirstName || form.LastName ? [form.FirstName, form.LastName].filter(Boolean).join(" ") : "Update your profile"}
                    </h1>
                    <p className="mt-1 text-base text-gray-500">@{form.username || "username"}</p>
                    <p className="mt-5 max-w-2xl border-l-2 border-gray-200 pl-4 text-base leading-7 text-gray-700">
                      Keep your profile accurate and polished. This is the information readers see when they open your profile.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/profile"
                    className="app-action-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Link>
                  <button
                    onClick={handleSubmit}
                    disabled={saving || usernameStatus.state === "checking" || usernameStatus.state === "taken" || usernameStatus.state === "invalid"}
                    type="button"
                    className="app-action-primary"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <form onSubmit={handleSubmit} className="space-y-6">
                  <section className="app-section">
                  <div className="mb-5 flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-950">Identity</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="First name" name="FirstName" value={form.FirstName} onChange={handleChange} />
                    <Field label="Last name" name="LastName" value={form.LastName} onChange={handleChange} />
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
                      <div className="relative">
                        <Input
                          name="username"
                          value={form.username}
                          onChange={handleChange}
                          autoComplete="off"
                          spellCheck={false}
                          aria-describedby="username-status"
                          className="pr-10"
                        />
                        {usernameStatus.state === "checking" ? (
                          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                        ) : null}
                      </div>
                      <div
                        id="username-status"
                        className={`mt-2 flex items-start gap-2 text-xs ${usernameStatusClasses[usernameStatus.state] || "text-gray-500"}`}
                      >
                        {UsernameStatusIcon ? <UsernameStatusIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : null}
                        <span>{usernameStatus.message}</span>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Profile type</label>
                      <select
                        name="profileType"
                        value={form.profileType}
                        onChange={handleChange}
                        className="h-11 w-full border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Professional">Professional</option>
                      </select>
                    </div>
                  </div>
                </section>

                  <section className="app-section">
                  <div className="mb-5 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-950">About</h2>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Bio</label>
                      <textarea
                        name="Bio"
                        value={form.Bio}
                        onChange={handleChange}
                        rows={5}
                        className="w-full border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500"
                        placeholder="Tell readers what you write about"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Website" name="website" value={form.website} onChange={handleChange} type="url" placeholder="https://..." />
                      <Field label="Location" name="location" value={form.location} onChange={handleChange} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Profile image URL</label>
                        <Input name="profileImageUrl" value={form.profileImageUrl} onChange={handleChange} placeholder="https://..." />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Date of birth</label>
                        <input
                          type="date"
                          name="dob"
                          value={form.dob || ""}
                          onChange={handleChange}
                          className="h-11 w-full border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                  <section className="app-section">
                  <div className="mb-5 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-950">Personal details</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Gender</label>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="h-11 w-full border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <Field label="Mobile number" name="mobile" value={form.mobile} onChange={handleChange} />
                  </div>
                </section>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <div className="flex gap-3 md:hidden">
                  <Link
                    href="/profile"
                    className="app-action-secondary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Link>
                  <Button
                    type="submit"
                    className="h-10 bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                    disabled={saving || usernameStatus.state === "checking" || usernameStatus.state === "taken" || usernameStatus.state === "invalid"}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>

              <aside className="space-y-4">
                <section className="app-section">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Preview</p>
                  <div className="mt-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14 border border-gray-200">
                        <AvatarImage src={form.profileImageUrl || profileMeta?.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-gray-900 text-white">
                          {avatarInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-950">
                          {[form.FirstName, form.LastName].filter(Boolean).join(" ") || "Your name"}
                        </p>
                        <p className="text-sm text-gray-500">@{form.username || "username"}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>{form.profileType || "Personal"} profile</p>
                      <p>Joined {formatJoinDate(profileMeta?.createdAt)}</p>
                      <p>{form.location || "Location not set"}</p>
                    </div>
                  </div>
                </section>

                <section className="app-section">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Notes</p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
                    <li>Username changes will update your post author cards and profile links.</li>
                    <li>Profile image, name, bio, and contact details are saved with your profile record.</li>
                    <li>For notification and privacy controls, open Settings.</li>
                  </ul>
                </section>
              </aside>
            </div>
          </section>
        )}
      </main>
      <Toaster />
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <Input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
      />
    </div>
  );
}

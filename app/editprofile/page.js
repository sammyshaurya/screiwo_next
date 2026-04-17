"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, Save, Shield, Sparkles, UserRound } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

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
  const [form, setForm] = useState(DEFAULT_FORM);
  const [profileMeta, setProfileMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/profile");
        if (!isMounted) return;
        setProfileMeta(response.data.profile);
        setForm(normalizeProfile(response.data.profile));
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
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await axios.patch("/api/profile", { profileData: form });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <ProfileNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        {loading ? (
          <section className="border border-gray-200 bg-white p-6 shadow-sm md:p-8">
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
          <section className="border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-950">Edit profile</h1>
            <p className="mt-3 text-gray-600">{error}</p>
                <Link
              href="/profile"
              className="mt-6 inline-flex h-10 items-center bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Back to profile
            </Link>
          </section>
        ) : (
          <section className="border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-7 md:px-8">
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
                    className="inline-flex h-10 items-center gap-2 border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Link>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    type="button"
                    className="inline-flex h-10 items-center gap-2 bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <section className="border border-gray-200 bg-white p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-950">Identity</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="First name" name="FirstName" value={form.FirstName} onChange={handleChange} />
                    <Field label="Last name" name="LastName" value={form.LastName} onChange={handleChange} />
                    <Field label="Username" name="username" value={form.username} onChange={handleChange} />
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

                <section className="border border-gray-200 bg-white p-6">
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

                <section className="border border-gray-200 bg-white p-6">
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
                    className="inline-flex h-10 items-center gap-2 border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Link>
                  <Button type="submit" className="h-10 bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>

              <aside className="space-y-4">
                <section className="border border-gray-200 bg-white p-6">
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

                <section className="border border-gray-200 bg-white p-6">
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

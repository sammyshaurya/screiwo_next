"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import Posts from "@/app/components/Pages/main/Posts";
import FollowersList from "../components/ui/FollowersList";
import FollowingsList from "../components/ui/FollowingsList";
import { formatRelativeTime } from "@/app/lib/time";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Settings,
  PenLine,
  Share2,
  Users,
} from "lucide-react";
import ProfileShell from "@/app/components/profile/ProfileShell";

function formatJoinDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function formatBirthday(dateValue) {
  if (!dateValue) {
    return "Not shared";
  }

  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function displayName(user) {
  return [user?.FirstName, user?.LastName].filter(Boolean).join(" ") || "Writer";
}

export default function Profile() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/");
    }
  }, [isLoaded, userId, router]);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get("/api/profile");
      setUser(response.data.profile);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!isLoaded || !userId) {
      return;
    }

    fetchProfile();
  }, [isLoaded, userId, fetchProfile]);

  const profileMetrics = useMemo(() => {
    return posts.reduce(
      (acc, post) => {
        acc.likes += post.likes || 0;
        acc.comments += post.commentscount || 0;
        acc.saves += post.saves || 0;
        acc.views += post.viewsCount || 0;
        return acc;
      },
      { likes: 0, comments: 0, saves: 0, views: 0 }
    );
  }, [posts]);

  const latestPost = posts[0] || null;
  const latestPostAt = latestPost?.createdAt || latestPost?.createdat || latestPost?.DateofCreation || null;
  const joinedLabel = formatJoinDate(user?.createdAt);
  const activitySnapshot = [
    {
      label: "Latest post",
      value: latestPost ? "Published" : "No posts",
      hint: latestPost?.title || "Publish a post to surface your latest writing here.",
    },
    {
      label: "Last post",
      value: latestPostAt ? formatRelativeTime(latestPostAt) : "No posts yet",
      hint: latestPost ? "Most recent writing activity." : "Your publishing timeline will appear here.",
    },
    {
      label: "Reads",
      value: profileMetrics.views,
      hint: "All-time reads across your library.",
    },
    {
      label: "Followers",
      value: user?.Followers || 0,
      hint: "Audience currently following your profile.",
    },
  ];
  const showProfileDetails = user?.preferences?.showProfileDetails !== false;

  const handleCopyProfile = async () => {
    if (!user?.username) {
      return;
    }

    try {
      const profileUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/user/${user.username}`
          : `/user/${user.username}`;
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error("Failed to copy profile URL:", error);
    }
  };

  return (
    <div className="app-page">
      <ProfileNav />
      <main className="app-shell">
        {isLoading && !user ? (
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
        ) : user ? (
          <ProfileShell
            profile={user}
            profileTypeLabel={user.profileType || "Writer"}
            title={displayName(user)}
            subtitle={`@${user.username}`}
            bio={user.Bio}
            featuredPost={latestPost ? {
              title: latestPost.title,
              excerpt: latestPost.excerpt || latestPost.contentText || "",
              href: `/post/${latestPost._id}`,
              coverImageUrl: latestPost.coverImageUrl || null,
            } : null}
            activitySnapshot={activitySnapshot}
            actions={[
              {
                href: "/createpost",
                label: "Write",
                icon: <PenLine className="h-4 w-4" />,
                className: "border border-white/10 bg-white text-slate-950 hover:bg-slate-100",
              },
              {
                href: "/settings",
                label: "Settings",
                icon: <Settings className="h-4 w-4" />,
                className: "border border-slate-700/80 bg-slate-900 text-slate-200 hover:border-slate-500 hover:bg-slate-800",
              },
              {
                onClick: handleCopyProfile,
                label: copied ? "Copied" : "Share",
                icon: <Share2 className="h-4 w-4" />,
                className: "border border-slate-700/80 bg-slate-900 text-slate-200 hover:border-slate-500 hover:bg-slate-800",
              },
            ]}
            statCards={[
              { label: "Posts", value: user.postCount || posts.length || 0, onClick: () => setActiveTab("posts") },
              { label: "Followers", value: user.Followers || 0, onClick: () => setShowFollowers(true) },
              { label: "Following", value: user.Followings || 0, onClick: () => setShowFollowing(true) },
              { label: "Reads", value: profileMetrics.views, onClick: () => setActiveTab("stats") },
            ]}
            tabs={[
              { id: "posts", label: "Posts" },
              { id: "about", label: "About" },
              { id: "stats", label: "Stats" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sidebarTop={
            <section className="app-section">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Featured
                </p>
                <h3 className="mt-3 text-xl font-black leading-snug text-white">
                  {latestPost ? latestPost.title : "No featured post yet"}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {latestPost
                    ? latestPost.excerpt || "Your latest post is highlighted here for returning readers."
                    : "Publish a post and it will become the starting point for readers visiting your profile."}
                </p>
                {latestPost ? (
                  <Link
                    href={`/post/${latestPost._id}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-slate-300"
                  >
                    Read featured post
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </section>
            }
            sidebarBottom={
              <>
            <section className="app-section">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Reader context
                </p>
                <div className="mt-5 space-y-4 text-sm text-slate-300">
                  {showProfileDetails && joinedLabel ? (
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-white" />
                      <span>Joined {joinedLabel}</span>
                    </div>
                  ) : !showProfileDetails ? (
                    <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/80 px-4 py-3 text-sm text-slate-400">
                      Profile details are hidden on the main profile.
                    </div>
                  ) : null}
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-white" />
                      <span>{user.Followers || 0} followers</span>
                    </div>
                  </div>
                </section>
              </>
            }
            emptyState={null}
          >
            {showFollowers && (
              <FollowersList
                handleFollowersClick={() => setShowFollowers(false)}
                user={user.username}
                ownerId={user.userid}
                viewerIsOwner={true}
                onMutate={() => fetchProfile()}
              />
            )}
            {showFollowing && (
              <FollowingsList
                handleFollowingClick={() => setShowFollowing(false)}
                user={user.username}
              />
            )}

            {activeTab === "posts" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Library
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                      Published writing
                    </h2>
                  </div>
                  <Link
                    href="/createpost"
                    className="hidden items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-white sm:inline-flex"
                  >
                    New post
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {posts.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-slate-700/80 bg-slate-900/80 px-8 py-12 text-center">
                    <FileText className="mx-auto h-8 w-8 text-slate-400" />
                    <h3 className="mt-4 text-xl font-bold text-white">
                      Start your first post
                    </h3>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                      Your profile is ready. Publish a story, note, or idea so readers have something to explore.
                    </p>
                    <Link
                      href="/createpost"
                      className="mt-6 inline-flex h-10 items-center rounded-full border border-slate-700 bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      Write first post
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {posts.map((post) => (
                      <Posts key={post._id} post={post} profile={user} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "about" && (
              <div className="grid gap-5 md:grid-cols-2">
            <section className="app-section">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Profile
                  </p>
                  {showProfileDetails ? (
                    <dl className="mt-5 space-y-4">
                      <div>
                        <dt className="text-sm text-slate-400">Display name</dt>
                        <dd className="mt-1 font-semibold text-white">{displayName(user)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-slate-400">Username</dt>
                        <dd className="mt-1 font-semibold text-white">@{user.username}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-slate-400">Joined</dt>
                        <dd className="mt-1 font-semibold text-white">{formatJoinDate(user.createdAt) || "Not available"}</dd>
                      </div>
                      {user.website ? (
                        <div>
                          <dt className="text-sm text-slate-400">Website</dt>
                          <dd className="mt-1 font-semibold text-white">
                            <a href={user.website.startsWith("http") ? user.website : `https://${user.website}`} target="_blank" rel="noreferrer" className="transition hover:text-slate-300">
                              {user.website}
                            </a>
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/80 px-5 py-6 text-sm leading-6 text-slate-400">
                      Profile details are hidden by your preference. Your bio and posts remain visible where allowed.
                    </div>
                  )}
                </section>

            <section className="app-section">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Details
                  </p>
                  {showProfileDetails ? (
                    <dl className="mt-5 space-y-4">
                      <div>
                        <dt className="text-sm text-slate-400">Profile type</dt>
                        <dd className="mt-1 font-semibold text-white">{user.profileType || "Personal"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-slate-400">Birthday</dt>
                        <dd className="mt-1 font-semibold text-white">{formatBirthday(user.dob)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-slate-400">Gender</dt>
                        <dd className="mt-1 font-semibold text-white">{user.gender || "Not shared"}</dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/80 px-5 py-6 text-sm leading-6 text-slate-400">
                      Only your posts and public activity are shown here.
                    </div>
                  )}
                </section>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Likes", value: profileMetrics.likes },
                  { label: "Comments", value: profileMetrics.comments },
                  { label: "Bookmarks", value: profileMetrics.saves },
                  { label: "Reads", value: profileMetrics.views },
                ].map((item) => (
                  <section key={item.label} className="rounded-[24px] border border-slate-800/80 bg-slate-900/90 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.35)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
                  </section>
                ))}
              </div>
            )}
          </ProfileShell>
        ) : (
          <section className="app-panel rounded-[28px] p-8 text-center">
            <h1 className="text-2xl font-black text-white">Profile not available</h1>
            <p className="mt-3 text-slate-300">We could not load your profile right now.</p>
          </section>
        )}
      </main>
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import Posts from "@/app/components/Pages/main/Posts";
import FollowersList from "@/app/components/ui/FollowersList";
import FollowingsList from "@/app/components/ui/FollowingsList";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Copy,
  FileText,
  Share2,
  UserPlus,
  Users,
} from "lucide-react";
import ProfileShell from "@/app/components/profile/ProfileShell";
import {
  PROFILE_AVATAR_CLASS,
  PROFILE_AVATAR_FALLBACK_CLASS,
  PROFILE_HERO_HEADER_CLASS,
} from "@/app/components/profile/profileStyles";
import { followUser as followProfile, unfollowUser as unfollowProfile } from "@/app/lib/api";

function formatJoinDate(dateValue) {
  if (!dateValue) {
    return "Recently joined";
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
  return [user?.FirstName, user?.LastName].filter(Boolean).join(" ") || user?.username || "Profile";
}

export default function UsersProfile({ params }) {
  const searchUser = params.username;
  const [curUser, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [relationship, setRelationship] = useState("none");
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const followed = relationship === "following";
  const requested = relationship === "requested";

  const fetchData = useCallback(async ({ preferCache = true } = {}) => {
    if (!searchUser) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/profile/usersprofile?username=${encodeURIComponent(searchUser)}`
      );

      const nextData = {
        userProfile: response.data.userProfile,
        posts: response.data.posts || [],
        isFollowing: response.data.isFollowing,
        isRequested: response.data.isRequested,
        relationship: response.data.relationship || (response.data.isFollowing ? "following" : response.data.isRequested ? "requested" : "none"),
      };

      setUser(nextData.userProfile);
      setPosts(nextData.posts);
      setRelationship(nextData.relationship);
      setIsPrivate(Boolean(response.data.isPrivate));
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error?.response?.status === 403) {
        const privateProfile = error.response.data?.userProfile || null;
        setUser(privateProfile);
        setPosts([]);
        setRelationship(error.response.data?.relationship || (error.response.data?.isFollowing ? "following" : error.response.data?.isRequested ? "requested" : "none"));
        setIsPrivate(true);
        return;
      }
      toast.error("Could not load this profile right now.");
    } finally {
      setIsLoading(false);
    }
  }, [searchUser]);

  useEffect(() => {
    fetchData({ preferCache: true });
  }, [fetchData]);

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

  const submitFollow = async (toFollow) => {
    try {
      const response = followed || requested
        ? await unfollowProfile(toFollow)
        : await followProfile(toFollow);

      if (response.status >= 200 && response.status < 300) {
        const nextRelationship = response.data?.relationship || ((followed || requested) ? "none" : "following");
        const actorSnapshot = response.data?.actorProfile || null;
        const targetSnapshot = response.data?.targetProfile || null;
        setRelationship(nextRelationship);
        toast.success(
          nextRelationship === "following"
            ? "Now following this profile."
            : followed || requested
              ? "Relationship removed."
              : "Follow request sent."
        );
        const nextProfile = targetSnapshot ? { ...targetSnapshot } : curUser;
        setIsPrivate(Boolean(nextProfile?.preferences?.profileVisibility === "private"));
        setUser(nextProfile);
      }
    } catch (error) {
      console.error("Error following profile:", error);
      toast.error("We could not follow this profile.");
    }
  };

  const handleCopyProfile = async () => {
    if (!curUser?.username) {
      return;
    }

    try {
      const profileUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/user/${curUser.username}`
          : `/user/${curUser.username}`;
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error("Failed to copy profile URL:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <ProfileNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        {!curUser && isLoading ? (
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
        ) : isPrivate && curUser ? (
          <section className="border border-gray-200 bg-white shadow-sm">
            <div className={PROFILE_HERO_HEADER_CLASS}>
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="shrink-0">
                    <Avatar className={PROFILE_AVATAR_CLASS}>
                      <AvatarImage src={curUser.profileImageUrl || undefined} />
                      <AvatarFallback className={PROFILE_AVATAR_FALLBACK_CLASS}>
                        {(curUser.username || "P").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                      Private profile
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
                      {displayName(curUser)}
                    </h1>
                    <p className="mt-1 text-base text-gray-500">@{curUser.username}</p>
                    <p className="mt-5 max-w-2xl border-l-2 border-gray-200 pl-4 text-base leading-7 text-gray-700">
                      {curUser.Bio || "This profile is private. Follow to request access to posts and details."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="space-y-6">
                  <section className="grid gap-4 md:grid-cols-3">
                    {[
                      { label: "Posts", value: curUser.postCount || posts.length || 0 },
                      { label: "Followers", value: curUser.Followers || 0 },
                      { label: "Following", value: curUser.Followings || 0 },
                    ].map((item) => (
                      <div key={item.label} className="border border-gray-200 bg-white px-5 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-bold text-gray-950">{item.value}</p>
                      </div>
                    ))}
                  </section>

                  <div className="border border-dashed border-gray-300 bg-white px-8 py-12 text-center">
                    <FileText className="mx-auto h-8 w-8 text-gray-400" />
                    <h3 className="mt-4 text-xl font-bold text-gray-950">
                      Posts are hidden
                    </h3>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
                      You can view this profile’s details, but the writing stays locked until access is approved.
                    </p>
                  </div>
                </div>

                <aside className="space-y-4">
                  <section className="border border-gray-200 bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                      Actions
                    </p>
                    <div className="mt-5 space-y-3">
                      <button
                        onClick={() => submitFollow(curUser.userid)}
                        type="button"
                        className={`inline-flex h-10 w-full items-center justify-center gap-2 px-4 text-sm font-semibold transition ${
                          followed || requested
                            ? "border border-gray-300 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        <UserPlus className="h-4 w-4" />
                        {followed ? "Unfollow" : requested ? "Cancel request" : "Request access"}
                      </button>
                      <button
                        onClick={handleCopyProfile}
                        type="button"
                        className="inline-flex h-10 w-full items-center justify-center gap-2 border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50"
                      >
                        <Share2 className="h-4 w-4" />
                        {copied ? "Copied" : "Share"}
                      </button>
                    </div>
                  </section>
                  <section className="border border-gray-200 bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                      Privacy
                    </p>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      This profile is private. Followers approved by the owner can see the posts.
                    </p>
                  </section>
                </aside>
              </div>
          </section>
        ) : !curUser ? (
          <section className="border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-950">Profile not available</h1>
            <p className="mt-3 text-gray-600">We could not load this profile right now.</p>
          </section>
        ) : (
          <ProfileShell
            profile={curUser}
            profileTypeLabel={curUser.profileType || "Writer"}
            title={[curUser.FirstName, curUser.LastName].filter(Boolean).join(" ") || "Profile"}
            subtitle={`@${curUser.username}`}
            bio={curUser.Bio}
            actions={[
              {
                onClick: () => submitFollow(curUser.userid),
                label: followed ? "Unfollow" : requested ? "Cancel request" : isPrivate ? "Request access" : "Follow",
                icon: <UserPlus className="h-4 w-4" />,
                className: followed || requested
                  ? "border border-gray-300 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50"
                  : "bg-blue-600 text-white hover:bg-blue-700",
                disabled: false,
              },
              {
                onClick: handleCopyProfile,
                label: copied ? "Copied" : "Share",
                icon: <Share2 className="h-4 w-4" />,
                className: "border border-gray-300 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50",
              },
            ]}
            statCards={[
              { label: "Posts", value: curUser.postCount || posts.length || 0 },
              { label: "Followers", value: curUser.Followers || 0, onClick: () => setShowFollowers(true) },
              { label: "Following", value: curUser.Followings || 0, onClick: () => setShowFollowing(true) },
              { label: "Reads", value: profileMetrics.views },
            ]}
            tabs={[]}
            sidebarTop={
              <section className="border border-gray-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Featured
                </p>
                <h3 className="mt-3 text-xl font-bold leading-snug text-gray-950">
                  {latestPost ? latestPost.title : "No featured post yet"}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {latestPost
                    ? latestPost.excerpt || "Their newest post is the easiest way to get a feel for what they write about."
                    : "Follow this profile and check back later for their first published post."}
                </p>
                {latestPost ? (
                  <Link
                    href={`/post/${latestPost._id}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                  >
                    Read latest post
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </section>
            }
            sidebarBottom={
              <section className="border border-gray-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Reader context
                </p>
                <div className="mt-5 space-y-4 text-sm text-gray-700">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>{curUser.Followers || 0} followers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <span>{curUser.Followings || 0} following</span>
                  </div>
                </div>
              </section>
            }
          >
            {showFollowers && (
              <FollowersList
                handleFollowersClick={() => setShowFollowers(false)}
                user={curUser.username}
              />
            )}
            {showFollowing && (
              <FollowingsList
                handleFollowingClick={() => setShowFollowing(false)}
                user={curUser.username}
              />
            )}

            <div className="space-y-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                    Library
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                    Published writing
                  </h2>
                </div>
              </div>

              {posts.length === 0 ? (
                <div className="border border-dashed border-gray-300 bg-white px-8 py-12 text-center">
                  <FileText className="mx-auto h-8 w-8 text-gray-400" />
                  <h3 className="mt-4 text-xl font-bold text-gray-950">
                    This profile is still quiet
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
                    Once they publish something, it will show up here. For now, you can follow them and check back later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {posts.map((post) => (
                    <Posts key={post._id} post={post} profile={curUser} />
                  ))}
                </div>
              )}

              <section className="grid gap-5 md:grid-cols-2">
                <section className="border border-gray-200 bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                    Profile
                  </p>
                  <dl className="mt-5 space-y-4">
                    <div>
                      <dt className="text-sm text-gray-500">Display name</dt>
                      <dd className="mt-1 font-semibold text-gray-950">
                        {[curUser.FirstName, curUser.LastName].filter(Boolean).join(" ") || "Not shared"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Username</dt>
                      <dd className="mt-1 font-semibold text-gray-950">@{curUser.username}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Joined</dt>
                      <dd className="mt-1 font-semibold text-gray-950">{formatJoinDate(curUser.createdAt)}</dd>
                    </div>
                  </dl>
                </section>

                <section className="border border-gray-200 bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                    Details
                  </p>
                  <dl className="mt-5 space-y-4">
                    <div>
                      <dt className="text-sm text-gray-500">Profile type</dt>
                      <dd className="mt-1 font-semibold text-gray-950">{curUser.profileType || "Personal"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Birthday</dt>
                      <dd className="mt-1 font-semibold text-gray-950">{formatBirthday(curUser.dob)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Bio</dt>
                      <dd className="mt-1 text-base leading-7 text-gray-700">
                        {curUser.Bio || "No bio added yet."}
                      </dd>
                    </div>
                  </dl>
                </section>
              </section>

              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Likes", value: profileMetrics.likes },
                  { label: "Comments", value: profileMetrics.comments },
                  { label: "Bookmarks", value: profileMetrics.saves },
                  { label: "Reads", value: profileMetrics.views },
                ].map((item) => (
                  <section key={item.label} className="border border-gray-200 bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      {item.label}
                    </p>
                    <p className="mt-3 text-3xl font-bold text-gray-950">{item.value}</p>
                  </section>
                ))}
              </section>
            </div>
          </ProfileShell>
        )}
      </main>
      <Toaster />
    </div>
  );
}

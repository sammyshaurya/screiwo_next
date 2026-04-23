"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useActionLock } from "@/app/lib/useActionLock";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import Posts from "@/app/components/Pages/main/Posts";
import FollowersList from "@/app/components/ui/FollowersList";
import FollowingsList from "@/app/components/ui/FollowingsList";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  FileText,
  Share2,
  UserPlus,
  Users,
} from "lucide-react";
import ProfileShell from "@/app/components/profile/ProfileShell";
import { followUser as followProfile, unfollowUser as unfollowProfile } from "@/app/lib/api";
import { formatRelativeTime } from "@/app/lib/time";
import { normalizeUsername } from "@/app/lib/username";

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
  return [user?.FirstName, user?.LastName].filter(Boolean).join(" ") || user?.username || "Profile";
}

export default function UsersProfile() {
  const { userId: signedUserId } = useAuth();
  const params = useParams();
  const searchUser = normalizeUsername(params?.username);
  const [curUser, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [relationship, setRelationship] = useState("none");
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const { run, activeKey, isBusy } = useActionLock(700);
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
  const latestPostAt = latestPost?.createdAt || latestPost?.createdat || latestPost?.DateofCreation || null;
  const joinedLabel = formatJoinDate(curUser?.createdAt);
  const showProfileDetails = curUser?.preferences?.showProfileDetails !== false;
  const isOwner = Boolean(curUser?.userid && signedUserId && curUser.userid === signedUserId);
  const canOpenRelationshipLists = !isPrivate || isOwner;
  const hasLatestPost = Boolean(latestPost?._id);
  const activitySnapshot = [
    {
      label: "Latest post",
      value: latestPost ? "Published" : "No posts",
      hint: latestPost?.title || "This creator has not published anything yet.",
    },
    {
      label: "Last post",
      value: latestPostAt ? formatRelativeTime(latestPostAt) : "No posts yet",
      hint: latestPost ? "Most recent writing activity." : "Once they publish, this will update automatically.",
    },
    {
      label: "Reads",
      value: profileMetrics.views,
      hint: "Total reads across visible posts.",
    },
    {
      label: "Followers",
      value: curUser?.Followers || 0,
      hint: "People following this profile.",
    },
  ];

  const submitFollow = async (toFollow) => {
    const followKey = `follow:${toFollow}`;
    try {
      const responseData = await run(followKey, async () => (
        followed || requested
          ? await unfollowProfile(toFollow)
          : await followProfile(toFollow)
      ));

      if (!responseData) {
        return;
      }

      const nextRelationship = responseData?.relationship || ((followed || requested) ? "none" : "following");
      const actorSnapshot = responseData?.actorProfile || null;
      const targetSnapshot = responseData?.targetProfile || null;

      setRelationship(nextRelationship);

      if (targetSnapshot) {
        setUser({ ...targetSnapshot });
        setIsPrivate(Boolean(targetSnapshot?.preferences?.profileVisibility === "private"));
      }

      if (actorSnapshot && actorSnapshot.userid === curUser?.userid) {
        setUser((prev) => ({
          ...(prev || {}),
          Followers: actorSnapshot.Followers ?? prev?.Followers ?? 0,
          Followings: actorSnapshot.Followings ?? prev?.Followings ?? 0,
          postCount: actorSnapshot.postCount ?? prev?.postCount ?? 0,
        }));
      }

      if (!targetSnapshot) {
        await fetchData({ preferCache: false });
      }

      toast.success(
        nextRelationship === "following"
          ? "Now following this profile."
          : nextRelationship === "requested"
            ? "Follow request sent."
            : followed || requested
              ? "Unfollowed."
              : "Follow request sent."
      );
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

  const profilePostCount = curUser?.postCount || posts.length || 0;

  return (
    <div className="app-page">
      <ProfileNav />
      <main className="app-shell">
        {!curUser && isLoading ? (
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
        ) : isPrivate && curUser ? (
          <ProfileShell
            profile={curUser}
            profileTypeLabel="Private profile"
            title={displayName(curUser)}
            subtitle={`@${curUser.username}`}
            bio={curUser.Bio || "This profile is private. Follow to request access to posts and details."}
            featuredPost={hasLatestPost ? {
              title: latestPost.title,
              excerpt: latestPost.excerpt || latestPost.contentText || "",
              href: `/post/${latestPost._id}`,
              coverImageUrl: latestPost.coverImageUrl || null,
            } : null}
            activitySnapshot={activitySnapshot}
            badgeLabel={followed ? "Following" : requested ? "Request sent" : "Private"}
            actions={[
              {
                onClick: () => submitFollow(curUser.userid),
                label: followed ? "Unfollow" : requested ? "Cancel request" : "Request access",
                icon: <UserPlus className="h-4 w-4" />,
                loading: isBusy && activeKey === `follow:${curUser.userid}`,
                loadingLabel: followed ? "Unfollowing..." : requested ? "Cancelling..." : "Requesting...",
                className: followed || requested
                  ? "border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                  : "bg-slate-950 text-white hover:bg-slate-800",
              },
              hasLatestPost
                ? {
                    href: `/post/${latestPost._id}`,
                    label: "Read latest",
                    icon: <FileText className="h-4 w-4" />,
                    className: "border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50",
                  }
                : null,
              {
                onClick: handleCopyProfile,
                label: copied ? "Copied" : "Share",
                icon: <Share2 className="h-4 w-4" />,
                className: "border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50",
              },
            ].filter(Boolean)}
            statCards={[
              { label: "Posts", value: profilePostCount, onClick: () => setActiveTab("posts") },
              {
                label: "Followers",
                value: curUser.Followers || 0,
                onClick: canOpenRelationshipLists ? () => setShowFollowers(true) : undefined,
              },
              {
                label: "Following",
                value: curUser.Followings || 0,
                onClick: canOpenRelationshipLists ? () => setShowFollowing(true) : undefined,
              },
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
                  Privacy
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  This profile is private. Followers approved by the owner can see the posts.
                </p>
              </section>
            }
            sidebarBottom={
              <section className="app-section">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Reader context
                </p>
                <div className="mt-5 space-y-4 text-sm text-slate-700">
                  {showProfileDetails ? (
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-slate-950" />
                      <span>{curUser.Followers || 0} followers</span>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Profile details are hidden on the main profile.
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-4 w-4 text-slate-950" />
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

            {activeTab === "posts" && (
              <div className="border border-dashed border-slate-300 bg-white px-8 py-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-4 text-xl font-black text-slate-950">
                  Posts are hidden
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                  You can view this profile’s details, but the writing stays locked until access is approved.
                </p>
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
                        <dt className="text-sm text-slate-500">Display name</dt>
                        <dd className="mt-1 font-semibold text-slate-950">{displayName(curUser)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-slate-500">Username</dt>
                        <dd className="mt-1 font-semibold text-slate-950">@{curUser.username}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-slate-500">Joined</dt>
                        <dd className="mt-1 font-semibold text-slate-950">{joinedLabel || "Not available"}</dd>
                      </div>
                      {curUser.website ? (
                        <div>
                          <dt className="text-sm text-slate-500">Website</dt>
                          <dd className="mt-1 font-semibold text-slate-950">
                            <a href={curUser.website.startsWith("http") ? curUser.website : `https://${curUser.website}`} target="_blank" rel="noreferrer">
                              {curUser.website}
                            </a>
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
                      Profile details are hidden by the owner.
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
                        <dt className="text-sm text-slate-500">Profile type</dt>
                        <dd className="mt-1 font-semibold text-slate-950">{curUser.profileType || "Personal"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-slate-500">Birthday</dt>
                        <dd className="mt-1 font-semibold text-slate-950">{formatBirthday(curUser.dob)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-slate-500">Bio</dt>
                        <dd className="mt-1 text-base leading-7 text-slate-700">
                          {curUser.Bio || "No bio added yet."}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm leading-6 text-slate-600">
                      Only the public writing feed is shown here.
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
                  <section key={item.label} className="app-section">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{item.value}</p>
                  </section>
                ))}
              </div>
            )}
          </ProfileShell>
        ) : !curUser ? (
          <section className="app-panel p-8 text-center">
            <h1 className="text-2xl font-black text-slate-950">Profile not available</h1>
            <p className="mt-3 text-slate-600">We could not load this profile right now.</p>
          </section>
        ) : (
          <ProfileShell
            profile={curUser}
            profileTypeLabel={curUser.profileType || "Writer"}
            title={[curUser.FirstName, curUser.LastName].filter(Boolean).join(" ") || "Profile"}
            subtitle={`@${curUser.username}`}
            bio={curUser.Bio}
            featuredPost={hasLatestPost ? {
              title: latestPost.title,
              excerpt: latestPost.excerpt || latestPost.contentText || "",
              href: `/post/${latestPost._id}`,
              coverImageUrl: latestPost.coverImageUrl || null,
            } : null}
            activitySnapshot={activitySnapshot}
            actions={[
              {
                onClick: () => submitFollow(curUser.userid),
                label: followed ? "Unfollow" : requested ? "Cancel request" : isPrivate ? "Request access" : "Follow",
                icon: <UserPlus className="h-4 w-4" />,
                loading: isBusy && activeKey === `follow:${curUser.userid}`,
                loadingLabel: followed ? "Unfollowing..." : requested ? "Cancelling..." : isPrivate ? "Requesting..." : "Following...",
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
              <section className="app-section">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Featured
                </p>
                <h3 className="mt-3 text-xl font-black leading-snug text-slate-950">
                  {latestPost ? latestPost.title : "No featured post yet"}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {latestPost
                    ? latestPost.excerpt || "Their newest post is the easiest way to get a feel for what they write about."
                    : "Follow this profile and check back later for their first published post."}
                </p>
                {latestPost ? (
                  <Link
                    href={`/post/${latestPost._id}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:text-slate-600"
                  >
                    Read latest post
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </section>
            }
            sidebarBottom={
              <section className="app-section">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Reader context
                </p>
                <div className="mt-5 space-y-4 text-sm text-slate-700">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-slate-950" />
                    <span>{curUser.Followers || 0} followers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-4 w-4 text-slate-950" />
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
                        <dd className="mt-1 font-semibold text-gray-950">{joinedLabel || "Not available"}</dd>
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

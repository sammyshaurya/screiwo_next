"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  Flame,
  Loader2,
  PenSquare,
  Sparkles,
  TrendingUp,
  Users,
  Clock3,
  RefreshCw,
} from "lucide-react";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import EnhancedPostCard from "@/app/components/Pages/EnhancedPostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { followUser as followProfile } from "@/app/lib/api";
import { useActionLock } from "@/app/lib/useActionLock";
import { getRecentlyViewedPosts } from "@/app/lib/readingHistory";

const FEED_TABS = [
  { id: "for-you", label: "For you" },
  { id: "following", label: "Following" },
  { id: "trending", label: "Trending" },
  { id: "saved", label: "Saved" },
];

function sectionTitle(activeFeed) {
  switch (activeFeed) {
    case "following":
      return "Your trusted timeline";
    case "trending":
      return "What the community is talking about";
    case "saved":
      return "Your reading shelf";
    default:
      return "A feed tuned to your interests";
  }
}

function normalizeFeedPayload(activeFeed, payload) {
  if (activeFeed === "saved") {
    return Array.isArray(payload?.bookmarks) ? payload.bookmarks : [];
  }

  if (activeFeed === "following" && Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload?.posts) ? payload.posts : [];
}

function matchesTopic(post, topic) {
  if (!topic) {
    return true;
  }

  const haystack = [
    post?.title,
    post?.excerpt,
    post?.contentText,
    post?.username,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const normalized = topic.replace(/^#/, "").toLowerCase();
  return haystack.includes(normalized);
}

function HeroStat({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function TopicChip({ topic, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      <span>{topic}</span>
      {count ? (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
          {count}
        </span>
      ) : null}
    </button>
  );
}

function ContinueCard({ item }) {
  return (
    <Link
      href={`/post/${item._id}`}
      className="group min-w-[260px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {item.coverImageUrl ? (
        <div className="mb-4 overflow-hidden rounded-2xl border border-slate-100">
          <img
            src={item.coverImageUrl}
            alt={item.title || "Continue reading"}
            className="h-32 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="mb-4 flex h-32 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Clock3 className="h-6 w-6" />
        </div>
      )}
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Continue reading</p>
      <h3 className="mt-2 line-clamp-2 text-lg font-bold tracking-tight text-slate-950">{item.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
        {item.excerpt || "Tap to pick up where you left off."}
      </p>
      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-700">
        Resume
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function CreatorCard({ profile, onFollow, status, busy }) {
  const initials = (profile?.username || "U").charAt(0).toUpperCase();
  const label = status === "following" ? "Following" : status === "requested" ? "Requested" : profile?.isPrivate ? "Request" : "Follow";

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Link href={`/user/${profile.username}`} className="shrink-0">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-slate-700">
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt={profile.username} className="h-full w-full object-cover" />
          ) : initials}
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/user/${profile.username}`} className="block">
          <p className="truncate text-sm font-semibold text-slate-950">
            {[profile.FirstName, profile.LastName].filter(Boolean).join(" ") || profile.username}
          </p>
          <p className="text-xs text-slate-500">@{profile.username}</p>
        </Link>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
          {profile.Bio || "A creator worth following for new ideas and strong opinions."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span>{profile.Followers || 0} followers</span>
          <span>•</span>
          <span>{profile.postCount || 0} posts</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onFollow(profile)}
        disabled={busy || status === "following"}
        className={`inline-flex h-9 items-center justify-center rounded-full px-3 text-xs font-semibold transition ${
          status === "following"
            ? "border border-slate-200 bg-slate-50 text-slate-600"
            : "bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-70"
        }`}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : label}
      </button>
    </div>
  );
}

const Home = () => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [activeFeed, setActiveFeed] = useState("for-you");
  const [posts, setPosts] = useState([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);
  const [topicFilter, setTopicFilter] = useState("");
  const [creatorStatus, setCreatorStatus] = useState({});
  const { run, activeKey, isBusy } = useActionLock(700);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/");
    }
  }, [isLoaded, userId, router]);

  useEffect(() => {
    if (!isLoaded || !userId) {
      return;
    }

    const loadOverview = async () => {
      try {
        setOverviewLoading(true);
        const response = await axios.get("/api/home/overview");
        setOverview(response.data);
      } catch (error) {
        console.error("Error loading home overview:", error);
      } finally {
        setOverviewLoading(false);
      }
    };

    loadOverview();
  }, [isLoaded, userId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncRecent = () => {
      setRecentPosts(getRecentlyViewedPosts());
    };

    syncRecent();
    window.addEventListener("storage", syncRecent);
    window.addEventListener("focus", syncRecent);

    return () => {
      window.removeEventListener("storage", syncRecent);
      window.removeEventListener("focus", syncRecent);
    };
  }, []);

  const loadFeed = useCallback(async (feedId) => {
    try {
      setIsLoadingFeed(true);
      setFeedError("");

      let response;
      if (feedId === "following") {
        response = await axios.get("/api/users/feed");
      } else if (feedId === "trending") {
        response = await axios.get("/api/feed/trending");
      } else if (feedId === "saved") {
        response = await axios.get("/api/posts/bookmark", { params: { page: 1, limit: 20 } });
      } else {
        response = await axios.get("/api/feed/recommended");
      }

      setPosts(normalizeFeedPayload(feedId, response.data));
    } catch (error) {
      console.error("Error fetching feed:", error);
      setFeedError("We could not load this feed right now.");
      setPosts([]);
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !userId) {
      return;
    }

    loadFeed(activeFeed);
  }, [activeFeed, isLoaded, userId, loadFeed]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextTab = new URLSearchParams(window.location.search).get("tab");
    if (nextTab && FEED_TABS.some((tab) => tab.id === nextTab) && nextTab !== activeFeed) {
      setActiveFeed(nextTab);
    }
  }, [activeFeed]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => matchesTopic(post, topicFilter));
  }, [posts, topicFilter]);

  const stats = overview?.stats || {};
  const suggestedCreators = overview?.suggestedCreators || [];
  const trendingTopics = overview?.trendingTopics || [];

  const handleFeedChange = (feedId) => {
    setActiveFeed(feedId);
    const nextUrl = feedId === "for-you" ? "/home" : `/home?tab=${feedId}`;
    router.replace(nextUrl, { scroll: false });
  };

  const handleFollowSuggestion = async (profile) => {
    const key = `suggest:${profile.userid}`;
    await run(key, async () => {
      const response = await followProfile(profile.userid);
      const nextRelationship = response?.relationship || (profile?.isPrivate ? "requested" : "following");
      setCreatorStatus((current) => ({ ...current, [profile.userid]: nextRelationship }));
    }).catch((error) => {
      console.error("Failed to follow suggestion:", error);
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(219,234,254,0.85),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <ProfileNav />

      <main className="mx-auto max-w-7xl px-4 pt-6 md:px-6 md:pt-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-950 px-5 py-6 text-white shadow-sm md:px-6 md:py-7">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                      Screiwo Home
                    </p>
                    <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
                      {sectionTitle(activeFeed)}
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                      Catch up, discover new voices, and continue reading without losing your place.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/createpost"
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                      <PenSquare className="h-4 w-4" />
                      Write
                    </Link>
                    <button
                      type="button"
                      onClick={() => loadFeed(activeFeed)}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingFeed ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <HeroStat label="Posts" value={overviewLoading ? "…" : stats.posts || 0} hint="Published from your profile" />
                <HeroStat label="Followers" value={overviewLoading ? "…" : stats.followers || 0} hint="People tracking your writing" />
                <HeroStat label="Following" value={overviewLoading ? "…" : stats.following || 0} hint="Creators shaping your feed" />
                <HeroStat label="Reads" value={overviewLoading ? "…" : stats.reads || 0} hint="Total views across your posts" />
              </div>

              {recentPosts.length > 0 ? (
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Continue</p>
                      <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Continue reading</h2>
                    </div>
                    <span className="text-sm font-semibold text-slate-500">Recent pages</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-1">
                    {recentPosts.map((item) => (
                      <ContinueCard key={item._id} item={item} />
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Feed</p>
                    <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Choose your stream</h2>
                  </div>
                  <Sparkles className="h-5 w-5 text-slate-400" />
                </div>

                <div className="sticky top-[4.75rem] z-20 -mx-5 border-y border-slate-200 bg-white/95 px-5 py-3 backdrop-blur md:static md:mx-0 md:border md:border-slate-200 md:rounded-2xl">
                  <div className="flex gap-2 overflow-x-auto">
                    {FEED_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleFeedChange(tab.id)}
                        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          activeFeed === tab.id
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTopicFilter("")}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      topicFilter ? "border-slate-200 bg-white text-slate-500" : "border-slate-950 bg-slate-950 text-white"
                    }`}
                  >
                    All topics
                  </button>
                  {trendingTopics.map((topic) => (
                    <TopicChip
                      key={topic.topic}
                      topic={topic.topic}
                      count={topic.count}
                      active={topicFilter === topic.topic}
                      onClick={() => setTopicFilter(topic.topic)}
                    />
                  ))}
                </div>
              </section>

              {isLoadingFeed ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-11 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="mt-4 h-6 w-3/4" />
                      <Skeleton className="mt-3 h-40 w-full rounded-2xl" />
                      <Skeleton className="mt-3 h-20 w-full" />
                    </div>
                  ))}
                </div>
              ) : feedError ? (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-600">
                  {feedError}
                </div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-5">
                  {filteredPosts.map((post) => (
                    <EnhancedPostCard key={post._id} post={post} currentUserId={userId} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white">
                    <Flame className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
                    Nothing here yet
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
                    Try another feed, follow a few more creators, or open trending topics to fill this space.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/home?tab=trending"
                      className="inline-flex h-10 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white"
                    >
                      Explore trending
                    </Link>
                    <Link
                      href="/createpost"
                      className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
                    >
                      Write a post
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                    Trending topics
                  </h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {trendingTopics.length > 0 ? trendingTopics.map((topic) => (
                    <TopicChip
                      key={topic.topic}
                      topic={topic.topic}
                      count={topic.count}
                      active={topicFilter === topic.topic}
                      onClick={() => setTopicFilter(topic.topic)}
                    />
                  )) : (
                    <p className="text-sm text-slate-500">Topic signals will appear here as the community grows.</p>
                  )}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                    Suggested creators
                  </h3>
                </div>
                <div className="mt-4 space-y-3">
                  {overviewLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="rounded-2xl border border-slate-200 p-4">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="mt-2 h-3 w-24" />
                        <Skeleton className="mt-4 h-8 w-full rounded-full" />
                      </div>
                    ))
                  ) : suggestedCreators.length > 0 ? (
                    suggestedCreators.map((profile) => (
                      <CreatorCard
                        key={profile.userid}
                        profile={profile}
                        status={creatorStatus[profile.userid] || "none"}
                        busy={isBusy && activeKey === `suggest:${profile.userid}`}
                        onFollow={handleFollowSuggestion}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">
                      Follow more creators to see richer suggestions here.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Quick actions
                </p>
                <div className="mt-4 space-y-3">
                  <Link
                    href="/createpost"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                  >
                    <div>
                      <p className="text-sm font-semibold">Write a post</p>
                      <p className="text-xs text-slate-400">Start something new</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300" />
                  </Link>
                  <Link
                    href="/bookmarks"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                  >
                    <div>
                      <p className="text-sm font-semibold">Bookmarks</p>
                      <p className="text-xs text-slate-400">Return to saved reading</p>
                    </div>
                    <Bookmark className="h-4 w-4 text-slate-300" />
                  </Link>
                  <Link
                    href="/follow-requests"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                  >
                    <div>
                      <p className="text-sm font-semibold">Requests</p>
                      <p className="text-xs text-slate-400">Private profile approvals</p>
                    </div>
                    <Users className="h-4 w-4 text-slate-300" />
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

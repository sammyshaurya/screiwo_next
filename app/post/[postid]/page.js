"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import CommentsSection from "../../components/Pages/CommentsSection";
import { recordRecentlyViewedPost } from "@/app/lib/readingHistory";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const VIEW_WINDOW_MS = 5000;

function getViewStorageKey(postid) {
  return `post-view:${postid}`;
}

function shouldCountView(postid) {
  if (typeof window === "undefined" || !postid) {
    return false;
  }

  const storageKey = getViewStorageKey(postid);
  const stored = window.sessionStorage.getItem(storageKey);

  if (!stored) {
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify({ status: "pending", ts: Date.now() })
    );
    return true;
  }

  try {
    const parsed = JSON.parse(stored);
    const isFresh = Date.now() - (parsed.ts || 0) < VIEW_WINDOW_MS;
    if (isFresh) {
      return false;
    }
  } catch {
    // Treat malformed state as stale and re-count.
  }

  window.sessionStorage.setItem(
    storageKey,
    JSON.stringify({ status: "pending", ts: Date.now() })
  );
  return true;
}

function markViewSettled(postid) {
  if (typeof window === "undefined" || !postid) {
    return;
  }

  window.sessionStorage.setItem(
    getViewStorageKey(postid),
    JSON.stringify({ status: "counted", ts: Date.now() })
  );
}

function clearViewPending(postid) {
  if (typeof window === "undefined" || !postid) {
    return;
  }

  window.sessionStorage.removeItem(getViewStorageKey(postid));
}

const AuthorCard = ({ author, follows }) => {
  const [isFollowed, setIsFollowed] = useState(false);
  return (
    <Card className="w-full border border-white/10 bg-[#05070d]/95 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <CardHeader className="justify-between gap-4 border-b border-white/10">
        <Link href={`/user/${author.username}`}>
          <div className="flex gap-5">
            <Avatar className="border border-white/10 bg-[#05070d]">
              <AvatarImage src={author.profileImageUrl} />
              <AvatarFallback className="bg-white/5 text-white">
                {author.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 items-start justify-center">
              <h4 className="text-small font-semibold leading-none text-white">
                {author.username}
              </h4>
              <h5 className="text-small tracking-tight text-white/60">
                @{author.username}
              </h5>
            </div>
          </div>
        </Link>
        {follows !== "myself" && (
          <Button
              className={isFollowed ? "border border-white/10 bg-white/[0.03] text-white/80" : ""}
              variant={isFollowed ? "outline" : "default"}
              size="sm"
              onClick={() => setIsFollowed(!isFollowed)}
            >
            {isFollowed ? "Unfollow" : "Follow"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-3 py-0 text-small text-white/70">
        <p>
          {author.bio ||
            "Frontend developer and UI/UX enthusiast. Join me on this coding adventure!"}
        </p>
        <span className="pt-2">
          #FrontendWithZoey
          <span className="py-2" aria-label="computer" role="img">
            💻
          </span>
        </span>
      </CardContent>
      <CardFooter className="gap-3 border-t border-white/10 bg-[#05070d]/80">
        <div className="flex gap-1">
          <p className="font-semibold text-white text-small">
            {author.Followers}
          </p>
          <p className="text-white/55 text-small">Following</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-white text-small">
            {author.Followings}
          </p>
          <p className="text-white/55 text-small">Followers</p>
        </div>
      </CardFooter>
    </Card>
  );
};

const PostPage = () => {
  const { postid } = useParams();
  const { user, isLoaded } = useUser();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (postid) {
      const countView = shouldCountView(postid);

        axios
        .get(`/api/getpost?postid=${postid}&countView=${countView ? "1" : "0"}`)
        .then((response) => {
          setPost(response.data);
          setLoading(false);
          recordRecentlyViewedPost(response.data);
          if (countView) {
            markViewSettled(postid);
          }
        })
        .catch((error) => {
          console.error(error);
          clearViewPending(postid);
          if (error?.response?.status === 403) {
            setError("This post is private.");
          } else {
            setError("Failed to load post.");
          }
          setLoading(false);
        });
    }
  }, [postid]);

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-page flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="app-page flex items-center justify-center">
        Post not found
      </div>
    );
  }

  return (
    <div className="app-page text-white">
      <ProfileNav />
      <header className="app-shell max-w-6xl py-8 md:py-10">
        <div className="space-y-5 border-b border-white/10 pb-8">
          <p className="app-kicker">Reading</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-white/55">
              <span>{new Date(post.DateofCreation || post.createdAt || post.createdat).toLocaleDateString()}</span>
              <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" />
              <span>{post.allowComments !== false ? "Comments open" : "Comments closed"}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="border border-white/10 bg-[#05070d]">
                <AvatarImage src={post.profileImageUrl} />
                <AvatarFallback className="bg-white/5 text-white">
                  {post.author.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/user/${post.author.username}`}>
                  <span className="text-sm font-semibold text-white">{post.author.username}</span>
                </Link>
                <p className="text-xs text-white/55">
                  {post.follows === "myself" ? "Your post" : "Creator profile"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="app-shell grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="w-full space-y-8">
          <article className="prose prose-invert prose-zinc max-w-none rounded-[1.75rem] border border-white/10 bg-[#05070d] p-6 text-lg shadow-[0_24px_70px_rgba(0,0,0,0.42)] md:p-8 md:pr-8 prose-headings:tracking-tight prose-headings:text-white prose-p:leading-8 prose-p:text-white/75 prose-strong:text-white prose-li:text-white/75 prose-a:text-white prose-a:underline-offset-4 hover:prose-a:text-white/80">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
          </article>
          <CommentsSection
            postId={postid}
            currentPostOwnerId={post.userid}
            currentUserId={isLoaded ? user?.id : null}
            currentUserName={user?.firstName || user?.username}
            currentUserImage={user?.imageUrl}
            allowComments={post.allowComments !== false}
          />
        </div>
        <div className="w-full lg:pt-2">
          <AuthorCard author={post.author} follows={post.follows} />
        </div>
      </main>
    </div>
  );
};

export default PostPage;

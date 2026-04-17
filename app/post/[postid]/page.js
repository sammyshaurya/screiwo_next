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
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
} from "@nextui-org/react";

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
    <Card className="w-full">
      <CardHeader className="justify-between">
        <Link href={`/user/${author.username}`}>
          <div className="flex gap-5">
            <Avatar>
              <AvatarImage src={author.profileImageUrl} />
              <AvatarFallback>{author.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 items-start justify-center">
              <h4 className="text-small font-semibold leading-none text-default-600">
                {author.username}
              </h4>
              <h5 className="text-small tracking-tight text-default-400">
                @{author.username}
              </h5>
            </div>
          </div>
        </Link>
        {follows !== "myself" && (
          <Button
            className={
              isFollowed
                ? "bg-transparent text-foreground border-default-200"
                : ""
            }
            color="primary"
            radius="full"
            size="sm"
            variant={isFollowed ? "bordered" : "solid"}
            onPress={() => setIsFollowed(!isFollowed)}
          >
            {isFollowed ? "Unfollow" : "Follow"}
          </Button>
        )}
      </CardHeader>
      <CardBody className="px-3 py-0 text-small text-default-400">
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
      </CardBody>
      <CardFooter className="gap-3">
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">
            {author.Followers}
          </p>
          <p className="text-default-400 text-small">Following</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">
            {author.Followings}
          </p>
          <p className="text-default-400 text-small">Followers</p>
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Post not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProfileNav />
      <header className="bg-muted py-12 md:py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold md:text-5xl noto">
              {post.title}
            </h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={post.profileImageUrl} />
                  <AvatarFallback>
                    {post.author.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Link href={`/user/${post.author.username}`}>
                  <span className="text-sm font-medium">
                    {post.author.username}
                  </span>
                </Link>
              </div>
              <span className="text-sm">
                  {new Date(post.DateofCreation || post.createdAt || post.createdat).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </header>
      <main className="container max-w-6xl mx-auto py-12 md:py-20 px-4 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-8 w-full">
          <article className="prose max-w-none text-lg prose-gray opensans dark:prose-invert md:border-r-2 border-gray-200 md:pr-8 pr-4 w-full">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
          </article>
          <CommentsSection
            postId={postid}
            currentUserId={isLoaded ? user?.id : null}
            currentUserName={user?.firstName || user?.username}
            currentUserImage={user?.imageUrl}
            allowComments={post.allowComments !== false}
          />
        </div>
        <div className="w-full">
          <AuthorCard author={post.author} follows={post.follows} />
        </div>
      </main>
    </div>
  );
};

export default PostPage;

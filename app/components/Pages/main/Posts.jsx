import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { getUiPreferences } from "@/app/lib/uiPreferences";
import { formatRelativeTime } from "@/app/lib/time";

export default function Posts({ post, profile }) {
  const authorUsername = profile?.username || post.username || "Writer";
  const profileImage = post.profileImageUrl || profile?.profileImageUrl || null;
  const previewText = post.excerpt || post.contentText || "";
  const coverImageUrl = post.coverImageUrl || null;
  const uiPrefs = getUiPreferences();
  const compactMode = Boolean(profile?.preferences?.compactMode ?? uiPrefs.compactMode);
  const hideMediaPreviews = Boolean(profile?.preferences?.hideMediaPreviews ?? uiPrefs.hideMediaPreviews);

  // Function to estimate reading time
  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  return (
    <Link href={`/post/${post._id}`}>
      <Card className={`border border-white/10 bg-[#05070d]/95 rounded-xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] hover:shadow-[0_22px_70px_rgba(0,0,0,0.5)] transition-shadow duration-200 overflow-hidden cursor-pointer ${compactMode ? "text-sm" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 ring-2 ring-white/10">
                <AvatarImage src={profileImage || undefined} />
                <AvatarFallback className="bg-white text-slate-950 text-xs font-semibold">
                  {authorUsername.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-white text-sm">{authorUsername}</p>
                <p className="text-xs text-white/55">
                  {formatRelativeTime(post.createdAt || post.createdat || post.DateofCreation)}
                </p>
              </div>
          </div>
          <div className="text-xs text-white/55">
              {getReadingTime(previewText || post?.content || "")} min
          </div>
        </div>

          <CardTitle className="text-xl font-bold text-white hover:text-white/80 transition-colors leading-tight line-clamp-2">
            {post?.title ? post.title : "Untitled Post"}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
        {coverImageUrl && !hideMediaPreviews && (
            <div className="mb-3 overflow-hidden rounded-lg border border-white/10">
              <img
                src={coverImageUrl}
                alt={post?.title || "Post preview image"}
                className={compactMode ? "h-32 w-full object-cover" : "h-40 w-full object-cover"}
              />
            </div>
          )}
          <div className="leading-relaxed text-white/70">
            {previewText ? (
              <div className="space-y-2">
                {post.hasHeadings && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                    Structured post
                  </p>
                )}
                <p className={`line-clamp-4 whitespace-pre-line ${compactMode ? "text-xs" : "text-sm"}`}>
                  {DOMPurify.sanitize(previewText)}
                </p>
              </div>
            ) : post?.content ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post?.content) }}
              />
            ) : (
              <p className="italic text-white/55">
                This post contains media or rich formatting without text preview yet.
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t border-white/10 pt-3 bg-[#05070d]/80">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-white/55">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm">{post.likes || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-white/55">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                  <span className="text-sm">{post.commentscount || 0}</span>
              </div>
            </div>
            <span className="font-medium text-sm text-white hover:text-white/75">
              Read →
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

"use client";

import React, { useState, useCallback } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Trash2, Edit, Loader2, Link2 } from 'lucide-react';
import Link from 'next/link';
import { likePost, unlikePost, bookmarkPost, unbookmarkPost } from '@/app/lib/api';
import { formatRelativeTime } from '@/app/lib/time';
import { useActionLock } from '@/app/lib/useActionLock';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PostCard({ post, onCommentClick, onEditClick, onDeleteClick, isLiked = false, isBookmarked = false, currentUserId }) {
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [savesCount, setSavesCount] = useState(post.saves || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const { run, activeKey, isBusy } = useActionLock(700);
  const authorName = post.username || post.author?.username || 'Unknown user';
  const authorImage = post.profileImageUrl || post.author?.profileImageUrl || null;
  const authorId = post.userid || post.author?.userid || null;
  const authorHref = post.author?.username || post.username ? `/user/${post.author?.username || post.username}` : '#';
  const previewText = post.excerpt || post.contentText || post.content || '';
  const coverImageUrl = post.coverImageUrl || null;
  const hasImage = Boolean(coverImageUrl) && !imageFailed;

  // Calculate reading time
  const wordCount = previewText.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  const handleLike = useCallback(async (e) => {
    e.preventDefault();
    try {
      const next = await run(`like:${post._id}`, async () => {
        if (liked) {
          await unlikePost(post._id);
          setLiked(false);
          setLikesCount((count) => Math.max(count - 1, 0));
        } else {
          await likePost(post._id);
          setLiked(true);
          setLikesCount((count) => count + 1);
        }
        return true;
      });
      return next;
    } catch (error) {
      console.error('Error toggling like:', error);
      setLiked(!liked);
      setLikesCount(liked ? likesCount + 1 : Math.max(likesCount - 1, 0));
    }
  }, [liked, likesCount, post._id, run]);

  const handleBookmark = useCallback(async (e) => {
    e.preventDefault();
    try {
      const next = await run(`bookmark:${post._id}`, async () => {
        if (bookmarked) {
          await unbookmarkPost(post._id);
          setBookmarked(false);
          setSavesCount((count) => Math.max(count - 1, 0));
        } else {
          await bookmarkPost(post._id);
          setBookmarked(true);
          setSavesCount((count) => count + 1);
        }
        return true;
      });
      return next;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      setBookmarked(!bookmarked);
      setSavesCount(bookmarked ? savesCount + 1 : Math.max(savesCount - 1, 0));
    }
  }, [bookmarked, savesCount, post._id, run]);

  const isAuthor = currentUserId === authorId;
  const postHref = `/post/${post._id}`;

  const handleShare = useCallback(async (e) => {
    e.preventDefault();

    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}${postHref}` : postHref;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: post.title || authorName,
          text: previewText.slice(0, 120),
          url: shareUrl,
        });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        return;
      }

      if (typeof window !== "undefined") {
        window.prompt("Copy link", shareUrl);
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  }, [authorName, post.title, postHref, previewText]);

  // Truncate content for preview
  const contentPreview = previewText.substring(0, 200) + (previewText.length > 200 ? '...' : '');

  return (
    <Card className="mx-auto mb-4 w-full max-w-[760px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#05070d] shadow-[0_18px_60px_rgba(0,0,0,0.38)] transition-shadow hover:border-white/20 hover:shadow-[0_24px_72px_rgba(0,0,0,0.48)]">
      <div className="space-y-4 px-4 py-4">
        {/* Post Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link href={authorHref} className="shrink-0">
              <Avatar className="h-10 w-10 border border-white/10">
                <AvatarImage src={authorImage || undefined} alt={authorName} />
                <AvatarFallback className="bg-white/10 text-sm font-semibold text-white">
                  {authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={authorHref} className="block text-sm font-semibold text-white hover:underline">
                <span className="truncate">{authorName}</span>
              </Link>
              <p className="text-xs text-white/55">
                {formatRelativeTime(post.DateofCreation || post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[11px] font-medium text-white/45 sm:flex">
              <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>{post.commentscount || 0} {post.commentscount === 1 ? 'comment' : 'comments'}</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>{readingTime} min read</span>
            </div>
            <div className="relative shrink-0">
              <button
                onClick={() => setShowMenu((current) => !current)}
                className="rounded-full p-1.5 transition-colors hover:bg-white/10"
                aria-label="Post actions"
              >
                <MoreHorizontal size={18} className="text-white/55" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 z-20 min-w-44 overflow-hidden rounded-xl border border-white/10 bg-[#0a0d14] shadow-xl">
                  <button
                    onClick={handleShare}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white/70 hover:bg-white/10"
                  >
                    <Link2 size={16} />
                    Copy link
                  </button>
                  {isAuthor ? (
                    <>
                      <button
                        onClick={() => {
                          onEditClick?.(post);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDeleteClick?.(post._id);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-300 hover:bg-white/10"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Post Title */}
        {post.title && (
          <Link href={postHref} className="block pt-1">
            <h3 className={`font-bold tracking-tight text-white ${hasImage ? "text-[1.35rem] sm:text-[1.65rem]" : "text-[1.65rem] sm:text-[2rem]"}`}>
              {post.title}
            </h3>
          </Link>
        )}

        {/* Post Content */}
        {hasImage ? (
          <div className="pt-2">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <img
              src={coverImageUrl}
              alt={post.title || 'Post preview image'}
              className="aspect-[4/5] w-full object-cover max-h-[420px] sm:aspect-video sm:max-h-none"
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
            </div>
          </div>
        ) : null}
        <p className={`pt-2 text-sm leading-6 ${hasImage ? "text-white/68" : "text-white/72"}`}>
          {contentPreview}
        </p>
        {previewText.length > 200 && (
          <Link href={postHref} className="inline-flex pt-1 text-sm font-medium text-white hover:underline">
            Read more →
          </Link>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-2 border-t border-white/10 pt-3">
          <Button
            onClick={handleLike}
            disabled={isBusy}
            aria-busy={activeKey === `like:${post._id}` ? "true" : undefined}
            variant="ghost"
            size="sm"
            className={`h-10 justify-center gap-2 rounded-full px-3 text-sm font-medium ${
              liked
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {activeKey === `like:${post._id}` ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            )}
            <span className="text-xs font-semibold tabular-nums">
              {likesCount}
            </span>
          </Button>

          <Button
            onClick={() => onCommentClick?.(post)}
            variant="ghost"
            size="sm"
            className="h-10 justify-center gap-2 rounded-full px-3 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
          >
            <MessageCircle size={18} />
            <span className="text-xs font-semibold tabular-nums">
              {post.commentscount || 0}
            </span>
          </Button>

          <Button
            onClick={handleBookmark}
            disabled={isBusy}
            aria-busy={activeKey === `bookmark:${post._id}` ? "true" : undefined}
            variant="ghost"
            size="sm"
            className={`h-10 justify-center gap-2 rounded-full px-3 text-sm font-medium ${
              bookmarked
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
          >
            {activeKey === `bookmark:${post._id}` ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

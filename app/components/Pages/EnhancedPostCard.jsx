'use client';

import React, { useState, useCallback } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { likePost, unlikePost, bookmarkPost, unbookmarkPost } from '@/app/lib/api';

export default function PostCard({ post, onCommentClick, onEditClick, onDeleteClick, isLiked = false, isBookmarked = false, currentUserId }) {
  const [liked, setLiked] = useState(isLiked);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [savesCount, setSavesCount] = useState(post.saves || 0);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const authorName = post.username || post.author?.username || 'Unknown user';
  const authorImage = post.profileImageUrl || post.author?.profileImageUrl || null;
  const authorId = post.userid || post.author?.userid || null;
  const authorHref = post.author?.username || post.username ? `/user/${post.author?.username || post.username}` : '#';
  const previewText = post.excerpt || post.contentText || post.content || '';
  const coverImageUrl = post.coverImageUrl || null;

  // Calculate reading time
  const wordCount = previewText.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  const handleLike = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (liked) {
        await unlikePost(post._id);
        setLiked(false);
        setLikesCount(Math.max(likesCount - 1, 0));
      } else {
        await likePost(post._id);
        setLiked(true);
        setLikesCount(likesCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert state on error
      setLiked(!liked);
      setLikesCount(liked ? likesCount + 1 : Math.max(likesCount - 1, 0));
    } finally {
      setLoading(false);
    }
  }, [liked, likesCount, post._id]);

  const handleBookmark = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (bookmarked) {
        await unbookmarkPost(post._id);
        setBookmarked(false);
        setSavesCount(Math.max(savesCount - 1, 0));
      } else {
        await bookmarkPost(post._id);
        setBookmarked(true);
        setSavesCount(savesCount + 1);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert state on error
      setBookmarked(!bookmarked);
      setSavesCount(bookmarked ? savesCount + 1 : Math.max(savesCount - 1, 0));
    } finally {
      setLoading(false);
    }
  }, [bookmarked, savesCount, post._id]);

  const isAuthor = currentUserId === authorId;

  // Truncate content for preview
  const contentPreview = previewText.substring(0, 200) + (previewText.length > 200 ? '...' : '');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow mb-4">
      {/* Post Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {authorImage && (
            <img
              src={authorImage}
              alt={authorName}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <Link href={authorHref} className="text-sm font-semibold text-gray-900 dark:text-white hover:underline">
              {authorName}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {post.DateofCreation ? new Date(post.DateofCreation).toLocaleDateString() : 'Recently'}
            </p>
          </div>
        </div>
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <MoreHorizontal size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => {
                    onEditClick?.(post);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDeleteClick?.(post._id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-slate-600 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Title */}
      {post.title && (
        <div className="px-4 pt-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{post.title}</h3>
        </div>
      )}

      {/* Post Content */}
      <div className="px-4 py-3">
        {coverImageUrl && (
          <div className="mb-3 overflow-hidden rounded-lg border border-gray-100 dark:border-slate-700">
            <img
              src={coverImageUrl}
              alt={post.title || 'Post preview image'}
              className="h-44 w-full object-cover"
            />
          </div>
        )}
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{contentPreview}</p>
        {previewText.length > 200 && (
          <Link href={`/post/${post._id}`} className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            Read more →
          </Link>
        )}
      </div>

      {/* Post Metadata */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-slate-700/50 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
        <span>{post.commentscount || 0} {post.commentscount === 1 ? 'comment' : 'comments'}</span>
        <span>{readingTime} min read</span>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 flex gap-1 border-t border-gray-100 dark:border-slate-700">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors text-sm font-medium ${
            liked
              ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          {liked ? 'Liked' : 'Like'}
        </button>

        <button
          onClick={() => onCommentClick?.(post)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <MessageCircle size={18} />
          Comment
        </button>

        <button
          onClick={handleBookmark}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors text-sm font-medium ${
            bookmarked
              ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
          {bookmarked ? 'Saved' : 'Save'}
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <Share2 size={18} />
          Share
        </button>
      </div>
    </div>
  );
}

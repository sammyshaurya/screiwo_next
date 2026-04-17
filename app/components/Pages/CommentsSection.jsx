'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Reply, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getComments, createComment, deleteComment } from '@/app/lib/api';
import Link from 'next/link';

export default function CommentsSection({ postId, currentUserId, currentUserName, currentUserImage }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const fetchComments = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getComments(postId, page);
      if (page === 1) {
        setComments(data.comments);
      } else {
        setComments((prevComments) => [...prevComments, ...data.comments]);
      }
    } catch (err) {
      setError('Failed to load comments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [postId, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createComment(postId, newComment.trim());
      setNewComment('');
      // Refresh comments
      setPage(1);
      await fetchComments();
    } catch (err) {
      setError('Failed to post comment');
      console.error(err);
    }
  };

  const handleReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await createComment(postId, replyText.trim(), commentId);
      setReplyText('');
      setReplyingTo(null);
      // Refresh comments
      setPage(1);
      await fetchComments();
    } catch (err) {
      setError('Failed to post reply');
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setPage(1);
      await fetchComments();
    } catch (err) {
      setError('Failed to delete comment');
      console.error(err);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-slate-700 pt-4">
      {/* Comment Input */}
      <div className="mb-4">
        <form onSubmit={handleCreateComment}>
          <div className="flex gap-3">
            {currentUserImage && (
              <img
                src={currentUserImage}
                alt={currentUserName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newComment.trim() || loading}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="space-y-3">
            {/* Main Comment */}
            <div className="flex gap-3">
              <Link href={`/user/${comment.userId?.username}`}>
                <img
                  src={comment.userId?.profileImageUrl || '/avatar.png'}
                  alt={comment.userId?.FirstName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                />
              </Link>
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                  <Link href={`/user/${comment.userId?.username}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:underline">
                    {comment.userId?.FirstName} {comment.userId?.LastName}
                  </Link>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{comment.text}</p>
                </div>
                <div className="flex gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  <button className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                    <Heart size={12} />
                    {comment.likesCount}
                  </button>
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                    className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                  >
                    <Reply size={12} />
                    Reply
                  </button>
                  {currentUserId === comment.userId?.userid && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Reply Input */}
            {replyingTo === comment._id && (
              <div className="ml-8 mb-3">
                <form onSubmit={(e) => handleReply(e, comment._id)} className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                  >
                    ✕
                  </button>
                </form>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 space-y-3">
                <button
                  onClick={() => toggleReplies(comment._id)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  {expandedReplies[comment._id] ? (
                    <>
                      <ChevronUp size={14} />
                      Hide {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </>
                  )}
                </button>

                {expandedReplies[comment._id] && (
                  <div className="space-y-3 pl-3 border-l-2 border-gray-300 dark:border-slate-600">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="flex gap-2">
                        <Link href={`/user/${reply.userId?.username}`}>
                          <img
                            src={reply.userId?.profileImageUrl || '/avatar.png'}
                            alt={reply.userId?.FirstName}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 cursor-pointer"
                          />
                        </Link>
                        <div className="flex-1">
                          <div className="bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-1.5">
                            <Link href={`/user/${reply.userId?.username}`} className="text-xs font-semibold text-gray-900 dark:text-white hover:underline">
                              {reply.userId?.FirstName}
                            </Link>
                            <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{reply.text}</p>
                          </div>
                          <div className="flex gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                            {currentUserId === reply.userId?.userid && (
                              <button
                                onClick={() => handleDeleteComment(reply._id)}
                                className="hover:text-red-600 flex items-center gap-1"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && !loading && (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      {loading && <p className="text-center text-gray-500 text-sm py-2">Loading comments...</p>}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { getBookmarks } from '@/app/lib/api';
import EnhancedPostCard from '../components/Pages/EnhancedPostCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BookmarksPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookmarks = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBookmarks(page, 10);
      setPosts(data.bookmarks);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center gap-3">
            <Link href="/home" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Saved Posts</h1>
          </div>
        </div>

        {/* Posts List */}
        <div className="p-4">
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Loading bookmarks...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No saved posts yet. Start bookmarking posts to see them here!
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {posts.map((post) => (
                  <EnhancedPostCard
                    key={post._id}
                    post={post}
                    isBookmarked={true}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded border border-gray-300 dark:border-slate-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded border border-gray-300 dark:border-slate-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { getBookmarks } from '@/app/lib/api';
import EnhancedPostCard from '../components/Pages/EnhancedPostCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProfileNav from '@/app/components/Pages/main/ProfileNav';

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
    <div className="app-page">
      <ProfileNav />
      <div className="app-shell max-w-3xl">
        <div className="app-panel sticky top-[4.75rem] z-10 rounded-t-none">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <Link href="/home" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <p className="app-kicker">Library</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Saved posts</h1>
            </div>
          </div>
        </div>

        <div className="space-y-4 py-6">
          {loading ? (
            <div className="app-section text-center text-slate-400">
              Loading bookmarks...
            </div>
          ) : posts.length === 0 ? (
            <div className="app-section text-center text-slate-400">
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
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="app-action-secondary h-10"
                  >
                    Previous
                  </button>
                  <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="app-action-secondary h-10"
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

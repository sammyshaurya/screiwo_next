'use client';

import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead } from '@/app/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProfileNav from '@/app/components/Pages/main/ProfileNav';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications(page, 20);
      setNotifications(data.notifications);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'like':
        return `liked your post`;
      case 'comment':
        return `commented on your post`;
      case 'reply':
        return `replied to your comment`;
      case 'follow':
        return `followed you`;
      default:
        return notification.message;
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      like: '❤️',
      comment: '💬',
      reply: '↩️',
      follow: '👤',
    };
    return icons[type] || '📝';
  };

  return (
    <div className="app-page">
      <ProfileNav />
      <div className="app-shell max-w-3xl">
        <div className="app-panel sticky top-[4.75rem] z-10 rounded-t-none">
          <div className="flex items-center gap-3 px-4 py-3 md:px-6">
            <Link href="/home" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <p className="app-kicker">Inbox</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Notifications</h1>
            </div>
          </div>
        </div>

        <div className="py-6">
          {loading ? (
            <div className="app-section text-center text-slate-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="app-section text-center text-slate-500">
              No notifications yet
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
              {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex gap-3 border-b border-slate-100 px-4 py-4 transition-colors cursor-pointer hover:bg-slate-50 ${
                  !notification.read ? 'bg-blue-50 dark:bg-slate-700/50' : ''
                }`}
                onClick={() => {
                  if (!notification.read) {
                    handleMarkAsRead(notification._id);
                  }
                }}
              >
                <div className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1">
                    <Link
                      href={notification.fromUserId?.username ? `/user/${notification.fromUserId.username}` : '/notifications'}
                      className="font-semibold text-gray-900 dark:text-white hover:underline"
                    >
                      {notification.fromUserId?.FirstName || notification.fromUserId?.username || 'Someone'} {notification.fromUserId?.LastName || ''}
                    </Link>
                    <span className="text-gray-600 dark:text-gray-400">
                      {getNotificationMessage(notification)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                    {new Date(notification.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></div>
                )}
              </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center gap-2 pb-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="app-action-secondary h-10 px-3"
            >
              Previous
            </button>
            <span className="inline-flex items-center px-3 py-2 text-sm font-semibold text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="app-action-secondary h-10 px-3"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

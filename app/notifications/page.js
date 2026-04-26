'use client';

import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead } from '@/app/lib/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProfileNav from '@/app/components/Pages/main/ProfileNav';
import useNotificationStream from '@/app/lib/useNotificationStream';

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

  useNotificationStream(() => {
    fetchNotifications();
  });

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
      case 'follow_request':
        return `sent you a follow request`;
      case 'follow_request_accepted':
        return `accepted your follow request`;
      case 'follow_request_declined':
        return `declined your follow request`;
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
      follow_request: '✉️',
      follow_request_accepted: '✅',
      follow_request_declined: '✖️',
    };
    return icons[type] || '📝';
  };

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
              <p className="app-kicker">Inbox</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Notifications</h1>
            </div>
          </div>
        </div>

        <div className="py-6">
          {loading ? (
            <div className="app-section text-center text-slate-400">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="app-section text-center text-slate-400">
              No notifications yet
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-800 bg-slate-900 shadow-[0_20px_60px_rgba(2,6,23,0.4)]">
              {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex cursor-pointer gap-3 border-b border-slate-800 px-4 py-4 transition-colors hover:bg-slate-800/70 ${
                  !notification.read ? 'bg-slate-800/60' : ''
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
                    className="font-semibold text-white hover:underline"
                    >
                      {notification.fromUserId?.FirstName || notification.fromUserId?.username || 'Someone'} {notification.fromUserId?.LastName || ''}
                    </Link>
                    <span className="text-slate-300">
                      {getNotificationMessage(notification)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                    {new Date(notification.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-white"></div>
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
            <span className="inline-flex items-center px-3 py-2 text-sm font-semibold text-slate-400">
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

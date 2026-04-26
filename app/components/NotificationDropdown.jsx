'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { getNotifications, getUnreadNotificationCount, markNotificationAsRead } from '@/app/lib/api';
import Link from 'next/link';
import useNotificationStream from '@/app/lib/useNotificationStream';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined' && document.hidden) {
      return undefined;
    }

    fetchUnreadCount();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      fetchUnreadCount();
    }, 30000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useNotificationStream(() => {
    fetchUnreadCount();
    if (showDropdown) {
      fetchNotifications();
    }
  });

  useEffect(() => {
    if (showDropdown) {
      fetchNotifications();
    }
  }, [showDropdown]);

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(1, 10);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error markingnotification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markNotificationAsRead(null, true);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
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
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative rounded-full p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-800 bg-slate-900 shadow-[0_30px_90px_rgba(2,6,23,0.6)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 p-4">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-xs text-blue-300 hover:underline"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                className="rounded p-1 hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-400">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`cursor-pointer border-b border-slate-800 p-4 transition-colors hover:bg-slate-800/70 ${
                    !notification.read ? 'bg-slate-800/60' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification._id);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1">
                        <Link
                          href={notification.fromUserId?.username ? `/user/${notification.fromUserId.username}` : '/notifications'}
                          className="truncate text-sm font-semibold text-white hover:underline"
                        >
                          {notification.fromUserId?.FirstName || notification.fromUserId?.username || 'Someone'}
                        </Link>
                        <span className="text-sm text-slate-300">
                          {getNotificationMessage(notification)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                        {new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {!notification.read && (
                        <div className="mt-2 h-2 w-2 rounded-full bg-slate-500"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-800 p-3 text-center">
            <Link
              href="/notifications"
              className="text-sm text-blue-300 hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { subscribeToNotificationSocket } from './notificationSocketClient';

const MIN_CONNECT_TIMEOUT_MS = 3000;
const MAX_CONNECT_TIMEOUT_MS = 15000;

export default function useNotificationStream(onNotification, enabled = true, fallbackIntervalMs = 12000) {
  const callbackRef = useRef(onNotification);
  const fallbackTimerRef = useRef(null);
  const connectTimeoutRef = useRef(null);
  const hasConnectedRef = useRef(false);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }

      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return undefined;
    }

    const startFallbackPolling = () => {
      if (!isVisibleRef.current || document.hidden) {
        return;
      }

      if (fallbackTimerRef.current) {
        return;
      }

      fallbackTimerRef.current = setInterval(() => {
        if (!isVisibleRef.current || document.hidden) {
          return;
        }

        callbackRef.current?.({ source: 'poll' });
      }, fallbackIntervalMs);
    };

    const stopFallbackPolling = () => {
      if (fallbackTimerRef.current) {
        clearInterval(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };

    const unsubscribe = subscribeToNotificationSocket({
      onNotification: (payload) => {
        callbackRef.current?.(payload);
      },
      onStatus: (status) => {
        if (status === 'connect') {
          hasConnectedRef.current = true;
          stopFallbackPolling();

          if (connectTimeoutRef.current) {
            clearTimeout(connectTimeoutRef.current);
            connectTimeoutRef.current = null;
          }

          return;
        }

        if (status === 'connect_error' || status === 'disconnect') {
          if (!hasConnectedRef.current) {
            startFallbackPolling();
          }
        }
      },
    });

    connectTimeoutRef.current = setTimeout(() => {
      if (!hasConnectedRef.current && isVisibleRef.current && !document.hidden) {
        startFallbackPolling();
      }
    }, Math.max(MIN_CONNECT_TIMEOUT_MS, Math.min(fallbackIntervalMs, MAX_CONNECT_TIMEOUT_MS)));

    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;

      if (document.hidden) {
        stopFallbackPolling();
        return;
      }

      if (!hasConnectedRef.current) {
        startFallbackPolling();
      }
    };

    isVisibleRef.current = !document.hidden;
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe?.();
      stopFallbackPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
    };
  }, [enabled, fallbackIntervalMs]);
}

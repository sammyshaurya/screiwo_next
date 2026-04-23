"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useActionLock(cooldownMs = 650) {
  const [activeKey, setActiveKey] = useState(null);
  const lockRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const run = useCallback(async (key, handler) => {
    if (lockRef.current) {
      return null;
    }

    lockRef.current = true;
    setActiveKey(key);

    try {
      return await handler();
    } finally {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        lockRef.current = false;
        setActiveKey(null);
      }, cooldownMs);
    }
  }, [cooldownMs]);

  const isBusy = activeKey !== null;

  return {
    activeKey,
    isBusy,
    run,
    isActive: (key) => activeKey === key,
  };
}

let socketInstance = null;
let socketPromise = null;
const notificationListeners = new Set();
const statusListeners = new Set();

function resolveSocketServerUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const explicitUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL?.trim();
  if (explicitUrl) {
    return explicitUrl;
  }

  const { protocol, hostname } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:3001`;
  }

  return window.location.origin;
}

function notifyNotificationListeners(payload) {
  notificationListeners.forEach((listener) => {
    try {
      listener?.(payload);
    } catch (error) {
      console.error("Notification websocket listener failed:", error);
    }
  });
}

function notifyStatusListeners(status, payload = {}) {
  statusListeners.forEach((listener) => {
    try {
      listener?.(status, payload);
    } catch (error) {
      console.error("Notification websocket status listener failed:", error);
    }
  });
}

async function ensureSharedSocket() {
  if (typeof window === "undefined") {
    return null;
  }

  if (socketInstance) {
    return socketInstance;
  }

  if (socketPromise) {
    return socketPromise;
  }

  socketPromise = (async () => {
    const socketServerUrl = resolveSocketServerUrl();
    if (!socketServerUrl) {
      return null;
    }

    const tokenResponse = await fetch("/api/socket/token", {
      cache: "no-store",
      credentials: "include",
    });

    if (!tokenResponse.ok) {
      if (tokenResponse.status !== 401) {
        notifyStatusListeners("connect_error", {
          message: "Unable to mint socket token",
        });
      }
      return null;
    }

    const tokenPayload = await tokenResponse.json();
    if (!tokenPayload?.token) {
      notifyStatusListeners("connect_error", {
        message: "Missing socket token",
      });
      return null;
    }

    const { io } = await import("socket.io-client");
    const socket = io(socketServerUrl, {
      auth: { token: tokenPayload.token },
      autoConnect: true,
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 5000,
    });

    socket.on("connect", () => {
      notifyStatusListeners("connect");
    });

    socket.on("connect_error", (error) => {
      notifyStatusListeners("connect_error", {
        message: error?.message || "Notification websocket connection failed",
      });
    });

    socket.on("disconnect", (reason) => {
      notifyStatusListeners("disconnect", { reason });
    });

    socket.on("notification:new", (payload) => {
      notifyNotificationListeners(payload);
    });

    socketInstance = socket;

    if (notificationListeners.size === 0 && statusListeners.size === 0) {
      socketInstance.disconnect();
      socketInstance = null;
      return null;
    }

    return socket;
  })()
    .catch((error) => {
      notifyStatusListeners("connect_error", {
        message: error?.message || "Notification websocket connection failed",
      });
      return null;
    })
    .finally(() => {
      socketPromise = null;
    });

  return socketPromise;
}

export function subscribeToNotificationSocket({ onNotification, onStatus } = {}) {
  if (typeof window === "undefined") {
    return () => {};
  }

  if (onNotification) {
    notificationListeners.add(onNotification);
  }

  if (onStatus) {
    statusListeners.add(onStatus);
  }

  if (socketInstance) {
    queueMicrotask(() => {
      notifyStatusListeners(socketInstance.connected ? "connect" : "disconnect", {
        reason: socketInstance.connected ? null : "pending",
      });
    });
  }

  ensureSharedSocket().catch((error) => {
    notifyStatusListeners("connect_error", {
      message: error?.message || "Notification websocket connection failed",
    });
  });

  return () => {
    if (onNotification) {
      notificationListeners.delete(onNotification);
    }

    if (onStatus) {
      statusListeners.delete(onStatus);
    }

    if (notificationListeners.size === 0 && statusListeners.size === 0 && socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  };
}

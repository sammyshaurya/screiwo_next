"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { useClickOutside } from "react-click-outside-hook";
import { Input } from "@nextui-org/input";
import logo from "@/public/Logo.png";
import SearchIcon from "/public/assets/Search";
import { formatRelativeTime } from "@/app/lib/time";
import {
  ArrowRight,
  Bell,
  Bookmark,
  CornerUpRight,
  Flame,
  House,
  Heart,
  MessageSquare,
  PenSquare,
  TrendingUp,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";

function NavPill({ href, label, icon: Icon, active = false, badge = null }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
          : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
      {badge ? (
        <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function getNotificationPreviewLabel(notification) {
  switch (notification?.type) {
    case "like":
      return "liked your post";
    case "comment":
      return "commented on your post";
    case "reply":
      return "replied to your comment";
    case "follow":
      return "followed you";
    default:
      return notification?.message || "sent you an update";
  }
}

function getNotificationPreviewIcon(notification) {
  switch (notification?.type) {
    case "like":
      return <Heart className="h-3.5 w-3.5" />;
    case "comment":
      return <MessageSquare className="h-3.5 w-3.5" />;
    case "reply":
      return <CornerUpRight className="h-3.5 w-3.5" />;
    case "follow":
      return <UserPlus className="h-3.5 w-3.5" />;
    default:
      return <Bell className="h-3.5 w-3.5" />;
  }
}

function getNotificationPreviewHref(notification) {
  if (notification?.postId?._id) {
    return `/post/${notification.postId._id}`;
  }

  if (notification?.fromUserId?.username) {
    return `/user/${notification.fromUserId.username}`;
  }

  return "/notifications";
}

const SearchInput = ({
  searchTerm,
  setSearchTerm,
  searchList,
  setSearchList,
  isDropdownOpen,
  setIsDropdownOpen,
  isExpanded,
  setIsExpanded,
  className = "",
  requestBadge = null,
}) => {
  const router = useRouter();
  const [searchWrapperRef, hasClickedOutside] = useClickOutside();
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestRef = useRef(0);

  const query = searchTerm.trim();
  const hasQuery = query.length > 0;
  const hasResults = searchList.length > 0;
  const showPanel = isDropdownOpen && (isFocused || hasQuery || hasInteracted || isLoading);

  const closeSearch = () => {
    setIsExpanded(false);
    setIsDropdownOpen(false);
    setIsFocused(false);
    setActiveIndex(-1);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (hasClickedOutside) {
        closeSearch();
      }
    }, 250);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setHasInteracted(true);
    setActiveIndex(-1);

    if (value.trim().length > 2) {
      const requestId = requestRef.current + 1;
      requestRef.current = requestId;
      setIsLoading(true);
      setIsDropdownOpen(true);

      fetch(`/api/allusers?q=${encodeURIComponent(value)}`)
        .then((response) => response.json())
        .then((data) => {
          if (requestRef.current !== requestId) {
            return;
          }

          setSearchList(
            Array.isArray(data)
              ? data.map((user) => ({
                  username: user.username,
                  userid: user.userid,
                }))
              : []
          );
        })
        .catch((error) => {
          if (requestRef.current !== requestId) {
            return;
          }
          console.error(error);
          setSearchList([]);
        })
        .finally(() => {
          if (requestRef.current === requestId) {
            setIsLoading(false);
          }
        });
    } else {
      requestRef.current += 1;
      setSearchList([]);
      setIsLoading(false);
      setIsDropdownOpen(true);
    }
  };

  const handleSelectResult = (user) => {
    closeSearch();
    router.push(`/user/${user.username}`);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      event.currentTarget.blur();
      return;
    }

    if (!showPanel || !hasResults) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % searchList.length);
      setIsDropdownOpen(true);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? searchList.length - 1 : current - 1));
      setIsDropdownOpen(true);
      return;
    }

    if (event.key === "Enter") {
      if (activeIndex >= 0 && searchList[activeIndex]) {
        event.preventDefault();
        handleSelectResult(searchList[activeIndex]);
      } else if (searchList[0]) {
        event.preventDefault();
        handleSelectResult(searchList[0]);
      }
    }
  };

  useEffect(() => {
    if (activeIndex >= searchList.length) {
      setActiveIndex(searchList.length - 1);
    }
  }, [searchList.length, activeIndex]);

  useEffect(() => {
    if (hasClickedOutside) {
      setIsExpanded(false);
      setIsDropdownOpen(false);
      setIsFocused(false);
      setActiveIndex(-1);
    }
  }, [hasClickedOutside, setIsDropdownOpen, setIsExpanded]);

  return (
    <div
      ref={searchWrapperRef}
      className={`relative w-full transform-gpu ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-2 hidden rounded-full bg-gradient-to-r from-slate-100 via-white to-slate-100 blur-xl transition-all duration-500 ease-out motion-reduce:transition-none lg:block ${
          isExpanded ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      />
      <Input
        radius="full"
        type="search"
        placeholder="Search people, posts, topics"
        value={searchTerm}
        onChange={handleInputChange}
        onBlur={handleSearchBlur}
        onFocus={() => {
          setIsFocused(true);
          setIsExpanded(true);
          setIsDropdownOpen(true);
          setHasInteracted(true);
        }}
        onKeyDown={handleInputKeyDown}
        aria-expanded={showPanel}
        aria-controls="nav-search-results"
        aria-autocomplete="list"
        startContent={<SearchIcon size={18} />}
        classNames={{
          inputWrapper:
            `h-11 border border-slate-200 bg-white px-1 shadow-sm transition-all duration-500 ease-out motion-reduce:transition-none hover:border-slate-300 data-[focus=true]:border-blue-300 data-[focus=true]:shadow-blue-50 ${
              isExpanded
                ? "lg:h-12 lg:-translate-y-0.5 lg:shadow-[0_22px_52px_rgba(15,23,42,0.16)]"
                : ""
            }`,
          input: "text-sm font-medium text-slate-900 placeholder:text-slate-400",
          inputWrapperInner: "px-2.5",
        }}
      />
      {showPanel ? (
        <div
          id="nav-search-results"
          role="listbox"
          aria-label="Search results"
          onMouseDown={(event) => event.preventDefault()}
          className="absolute top-[calc(100%+0.8rem)] z-[70] w-full origin-top overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white shadow-[0_34px_90px_rgba(15,23,42,0.2)] backdrop-blur-xl motion-safe:animate-[searchPanelIn_220ms_cubic-bezier(0.16,1,0.3,1)]"
        >
          <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/95 to-white px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Search
                </p>
                <p className="mt-1 text-sm font-semibold tracking-tight text-slate-950">
                  {isLoading
                    ? "Looking through the graph"
                    : hasQuery
                      ? `Results for \"${query}\"`
                      : "Type to search profiles"}
                </p>
              </div>
              {requestBadge ? (
                <span className="inline-flex items-center rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shadow-slate-950/15">
                  {requestBadge}
                </span>
              ) : null}
            </div>
          </div>

          <div className="max-h-[min(25rem,calc(100vh-12rem))] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-4"
                  >
                    <div className="h-11 w-11 animate-pulse rounded-full bg-slate-100" />
                    <div className="min-w-0 flex-1 space-y-2.5">
                      <div className="h-3.5 w-36 animate-pulse rounded-full bg-slate-100" />
                      <div className="h-3 w-28 animate-pulse rounded-full bg-slate-50" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hasResults ? (
              <div className="p-3">
                {searchList.map((user, index) => {
                  const active = index === activeIndex;
                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      key={user.userid}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleSelectResult(user)}
                    className={`flex w-full items-center gap-3 rounded-[1.15rem] border px-4 py-4 text-left transition-all duration-300 ease-out last:border-b-0 motion-reduce:transition-none ${
                        active
                          ? "border-slate-300 bg-slate-50 shadow-[0_10px_24px_rgba(15,23,42,0.08)] translate-y-[-1px]"
                          : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white shadow-sm shadow-slate-950/15">
                        {(user.username || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold tracking-tight text-slate-950">@{user.username}</p>
                        <p className="text-xs leading-5 text-slate-500">Open profile</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">↵</span>
                    </button>
                  );
                })}
              </div>
            ) : hasQuery || hasInteracted ? (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm shadow-slate-950/15">
                  <SearchIcon size={16} />
                </div>
                <h3 className="mt-4 text-sm font-semibold tracking-tight text-slate-950">No results found</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Try a shorter username or check the spelling. The search becomes more useful after three characters.
                </p>
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm shadow-slate-950/15">
                  <SearchIcon size={16} />
                </div>
                <h3 className="mt-4 text-sm font-semibold tracking-tight text-slate-950">Search the network</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Find people and open their profiles with a quick search.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const ProfileNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchList, setSearchList] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [notificationPreviewOpen, setNotificationPreviewOpen] = useState(false);
  const [notificationPreviewLoading, setNotificationPreviewLoading] = useState(false);
  const [notificationPreviewItems, setNotificationPreviewItems] = useState([]);
  const [notificationPreviewCoords, setNotificationPreviewCoords] = useState(null);
  const [notificationPreviewUpdatedAt, setNotificationPreviewUpdatedAt] = useState(0);
  const notificationTriggerRef = useRef(null);
  const notificationPanelRef = useRef(null);
  const notificationOpenTimerRef = useRef(null);
  const notificationCloseTimerRef = useRef(null);
  const notificationRequestRef = useRef(0);

  const desktopLinks = useMemo(
    () => [
      { href: "/home", label: "Home", icon: House },
      { href: "/home?tab=trending", label: "Explore", icon: Flame },
      { href: "/bookmarks", label: "Saved", icon: Bookmark },
      { href: "/profile", label: "Profile", icon: UserRound },
    ],
    []
  );

  const mobileLinks = useMemo(
    () => [
      { href: "/home", label: "Home", icon: House },
      { href: "/home?tab=trending", label: "Explore", icon: TrendingUp },
      { href: "/createpost", label: "Write", icon: PenSquare, primary: true },
      { href: "/bookmarks", label: "Saved", icon: Bookmark },
      { href: "/profile", label: "Me", icon: UserRound },
    ],
    []
  );

  const clearNotificationTimers = useCallback(() => {
    if (notificationOpenTimerRef.current) {
      clearTimeout(notificationOpenTimerRef.current);
      notificationOpenTimerRef.current = null;
    }

    if (notificationCloseTimerRef.current) {
      clearTimeout(notificationCloseTimerRef.current);
      notificationCloseTimerRef.current = null;
    }
  }, []);

  const updateNotificationPreviewPosition = useCallback(() => {
    if (typeof window === "undefined" || !notificationTriggerRef.current) {
      return;
    }

    const rect = notificationTriggerRef.current.getBoundingClientRect();
    const panelWidth = Math.min(24 * 16, window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 12));
    const top = rect.bottom + 14;

    setNotificationPreviewCoords({
      top,
      left,
      width: panelWidth,
    });
  }, []);

  const fetchNotificationPreview = useCallback(async () => {
    const now = Date.now();
    if (notificationPreviewItems.length > 0 && now - notificationPreviewUpdatedAt < 45000) {
      return;
    }

    const requestId = notificationRequestRef.current + 1;
    notificationRequestRef.current = requestId;
    setNotificationPreviewLoading(true);

    try {
      const response = await fetch("/api/notifications?page=1&limit=6");
      const data = await response.json();

      if (notificationRequestRef.current !== requestId) {
        return;
      }

      setNotificationPreviewItems(Array.isArray(data?.notifications) ? data.notifications : []);
      setNotificationPreviewUpdatedAt(Date.now());
    } catch (error) {
      if (notificationRequestRef.current !== requestId) {
        return;
      }

      console.error("Failed to load notification preview:", error);
      setNotificationPreviewItems([]);
    } finally {
      if (notificationRequestRef.current === requestId) {
        setNotificationPreviewLoading(false);
      }
    }
  }, [notificationPreviewItems.length, notificationPreviewUpdatedAt]);

  const openNotificationPreview = useCallback(() => {
    clearNotificationTimers();

    notificationOpenTimerRef.current = setTimeout(() => {
      setNotificationPreviewOpen(true);
      updateNotificationPreviewPosition();
      fetchNotificationPreview();
    }, 140);
  }, [clearNotificationTimers, fetchNotificationPreview, updateNotificationPreviewPosition]);

  const closeNotificationPreview = useCallback(() => {
    clearNotificationTimers();

    notificationCloseTimerRef.current = setTimeout(() => {
      setNotificationPreviewOpen(false);
    }, 180);
  }, [clearNotificationTimers]);

  const keepNotificationPreviewOpen = useCallback(() => {
    clearNotificationTimers();
  }, [clearNotificationTimers]);

  const hideNotificationPreview = useCallback(() => {
    clearNotificationTimers();
    setNotificationPreviewOpen(false);
  }, [clearNotificationTimers]);

  useEffect(() => {
    setIsSearchExpanded(false);
    setIsDropdownOpen(false);
    let mounted = true;

    const fetchBadges = async () => {
      try {
        const [notifResponse, requestsResponse] = await Promise.all([
          fetch("/api/notifications", { method: "HEAD" }),
          fetch("/api/profile/follow/requests"),
        ]);

        if (!mounted) {
          return;
        }

        if (notifResponse.ok) {
          setNotificationCount(parseInt(notifResponse.headers.get("x-unread-count") || "0", 10) || 0);
        }

        if (requestsResponse.ok) {
          const data = await requestsResponse.json();
          setRequestCount(Array.isArray(data?.requests) ? data.requests.length : 0);
        }
      } catch (error) {
        console.error("Failed to load nav badges:", error);
      }
    };

    fetchBadges();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!notificationPreviewOpen) {
      return;
    }

    const handlePointerDown = (event) => {
      const trigger = notificationTriggerRef.current;
      const panel = notificationPanelRef.current;

      if (trigger?.contains(event.target) || panel?.contains(event.target)) {
        return;
      }

      hideNotificationPreview();
    };

    const handleScrollOrResize = () => {
      updateNotificationPreviewPosition();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [hideNotificationPreview, notificationPreviewOpen, updateNotificationPreviewPosition]);

  useEffect(() => {
    if (notificationPreviewOpen) {
      updateNotificationPreviewPosition();
    }
  }, [notificationPreviewOpen, updateNotificationPreviewPosition]);

  useEffect(() => {
    setNotificationPreviewOpen(false);
    clearNotificationTimers();
  }, [pathname, clearNotificationTimers]);

  useEffect(() => {
    return () => {
      clearNotificationTimers();
    };
  }, [clearNotificationTimers]);

  const notificationPreviewPanel = notificationPreviewOpen && notificationPreviewCoords && typeof document !== "undefined"
    ? createPortal(
        <div
          ref={notificationPanelRef}
          onMouseEnter={keepNotificationPreviewOpen}
          onMouseLeave={closeNotificationPreview}
          className="fixed z-[95] hidden lg:block"
          style={{
            top: `${notificationPreviewCoords.top}px`,
            left: `${notificationPreviewCoords.left}px`,
            width: `${notificationPreviewCoords.width}px`,
          }}
        >
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white shadow-[0_40px_100px_rgba(15,23,42,0.22)] backdrop-blur-xl motion-safe:animate-[searchPanelIn_220ms_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/95 to-white px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Notifications
                </p>
                <p className="mt-1 text-sm font-semibold tracking-tight text-slate-950">
                  {notificationPreviewLoading
                    ? "Loading recent activity"
                    : notificationPreviewItems.length > 0
                      ? `${notificationPreviewItems.length} recent notification${notificationPreviewItems.length === 1 ? "" : "s"}`
                      : "You're all caught up"}
                </p>
              </div>
              {notificationCount > 0 ? (
                <span className="inline-flex items-center rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shadow-slate-950/15">
                  {notificationCount} unread
                </span>
              ) : null}
            </div>

            <div className="max-h-[22rem] overflow-y-auto">
              {notificationPreviewLoading ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-[1.15rem] border border-transparent px-4 py-4"
                    >
                      <div className="h-11 w-11 animate-pulse rounded-full bg-slate-100" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3.5 w-36 animate-pulse rounded-full bg-slate-100" />
                        <div className="h-3 w-28 animate-pulse rounded-full bg-slate-50" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notificationPreviewItems.length > 0 ? (
                <div className="p-3">
                  {notificationPreviewItems.map((notification) => {
                    const destination = getNotificationPreviewHref(notification);
                    const senderName = [
                      notification.fromUserId?.FirstName,
                      notification.fromUserId?.LastName,
                    ]
                      .filter(Boolean)
                      .join(" ") || notification.fromUserId?.username || "Someone";

                    return (
                      <Link
                        key={notification._id}
                        href={destination}
                        onClick={hideNotificationPreview}
                        className={`flex w-full items-start gap-3 rounded-[1.15rem] border px-4 py-4 text-left transition-all duration-300 ease-out motion-reduce:transition-none ${
                          notification.read
                            ? "border-transparent hover:border-slate-200 hover:bg-slate-50"
                            : "border-blue-100 bg-blue-50/70 hover:border-blue-200 hover:bg-blue-50"
                        }`}
                      >
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
                          notification.read
                            ? "bg-slate-950 shadow-slate-950/15"
                            : "bg-blue-600 shadow-blue-600/15"
                        }`}>
                          {getNotificationPreviewIcon(notification)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
                            <span className="max-w-full truncate text-sm font-semibold tracking-tight text-slate-950">
                              {senderName}
                            </span>
                            <span className="text-sm leading-6 text-slate-600">
                              {getNotificationPreviewLabel(notification)}
                            </span>
                          </div>
                          {notification.postId?.title ? (
                            <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                              {notification.postId.title}
                            </p>
                          ) : null}
                          <p className="mt-2 text-xs font-medium text-slate-400">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm shadow-slate-950/15">
                    <Bell className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold tracking-tight text-slate-950">
                    No recent notifications
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    When people like, follow, or comment, the latest activity will appear here.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3">
              <Link
                href="/notifications"
                onClick={hideNotificationPreview}
                className="inline-flex w-full items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                View all notifications
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid min-h-[4.75rem] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
            <Link href="/home" className="flex shrink-0 items-center gap-3 rounded-full px-1 py-1 transition hover:bg-slate-50">
              <Image
                src={logo}
                alt="Screiwo"
                width={176}
                height={56}
                priority
                sizes="(max-width: 1024px) 140px, 176px"
                className="h-10 w-auto sm:h-11 lg:h-12"
              />
            </Link>

            <div className="hidden min-w-0 items-center justify-center gap-3 lg:flex">
              <nav
                className={`flex min-w-0 items-center gap-2 overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
                  isSearchExpanded
                    ? "max-w-0 translate-x-2 opacity-0 pointer-events-none"
                    : "max-w-[30rem] opacity-100"
                }`}
              >
                {desktopLinks.map((item) => (
                  <NavPill
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={
                      pathname === item.href ||
                      (item.href === "/home" && pathname === "/") ||
                      (item.href === "/home?tab=trending" && pathname === "/home")
                    }
                    badge={item.badge}
                  />
                ))}
              </nav>

              <SearchInput
                className={`min-w-0 flex-shrink transition-[flex-basis,opacity,transform,max-width] duration-500 ease-out motion-reduce:transition-none ${
                  isSearchExpanded
                    ? "flex-[1_1_32rem] max-w-[36rem]"
                    : "flex-[0_0_18rem] max-w-[22rem]"
                }`}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchList={searchList}
                setSearchList={setSearchList}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
                isExpanded={isSearchExpanded}
                setIsExpanded={setIsSearchExpanded}
                requestBadge={requestCount > 0 ? requestCount : null}
              />
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/follow-requests"
                className="relative inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                <Users className="h-4 w-4" />
                Requests
                {requestCount > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-slate-950 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {requestCount}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/createpost"
                className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <PenSquare className="h-4 w-4" />
                Write
              </Link>
              <div
                ref={notificationTriggerRef}
                className="relative"
                onMouseEnter={openNotificationPreview}
                onMouseLeave={closeNotificationPreview}
              >
                <Link
                  href="/notifications"
                  onClick={hideNotificationPreview}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                      {notificationCount}
                    </span>
                  ) : null}
                </Link>
              </div>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>

            <div className="col-start-3 ml-auto flex items-center gap-2 lg:hidden">
              <Link
                href="/notifications"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                    {notificationCount}
                  </span>
                ) : null}
              </Link>
              <Link
                href="/follow-requests"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                aria-label="Follow requests"
              >
                <Users className="h-4 w-4" />
                {requestCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-[10px] font-bold text-white">
                    {requestCount}
                  </span>
                ) : null}
              </Link>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>

          <div className="pb-3 lg:hidden">
            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchList={searchList}
              setSearchList={setSearchList}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              isExpanded={isSearchExpanded}
              setIsExpanded={setIsSearchExpanded}
              requestBadge={requestCount > 0 ? requestCount : null}
            />
          </div>
        </div>
      </header>

      {notificationPreviewPanel}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-5 gap-2">
          {mobileLinks.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href === "/home" && pathname === "/") ||
              (item.href === "/home?tab=trending" && pathname === "/home");
            const activeStyles = item.primary
              ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20"
              : active
                ? "bg-blue-50 text-blue-700"
                : "text-slate-500";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition ${activeStyles}`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default ProfileNav;

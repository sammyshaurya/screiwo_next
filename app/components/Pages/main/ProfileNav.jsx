"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { useClickOutside } from "react-click-outside-hook";
import { Input } from "@nextui-org/input";
import logo from "@/public/Logo.png";
import SearchIcon from "/public/assets/Search";
import {
  Bell,
  Bookmark,
  Flame,
  House,
  PenSquare,
  Settings,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";

function NavPill({ href, label, icon: Icon, active = false, badge = null }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
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

const SearchInput = ({ searchTerm, setSearchTerm, searchList, setSearchList, isDropdownOpen, setIsDropdownOpen }) => {
  const router = useRouter();
  const [dropdownRef, hasClickedOutside] = useClickOutside();

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (hasClickedOutside) {
        setIsDropdownOpen(false);
      }
    }, 250);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 2) {
      fetch(`/api/allusers?q=${encodeURIComponent(value)}`)
        .then((response) => response.json())
        .then((data) => {
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
          console.error(error);
          setSearchList([]);
        });
    } else {
      setSearchList([]);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        radius="full"
        type="search"
        placeholder="Search people, posts, topics"
        value={searchTerm}
        onChange={handleInputChange}
        onBlur={handleSearchBlur}
        onFocus={() => setIsDropdownOpen(true)}
        startContent={<SearchIcon size={18} />}
        classNames={{
          inputWrapper:
            "border border-slate-200 bg-white shadow-sm hover:border-slate-300 data-[focus=true]:border-blue-300 data-[focus=true]:shadow-blue-50",
          input: "text-slate-900 placeholder:text-slate-400",
        }}
      />
      {isDropdownOpen && searchList.length > 0 ? (
        <div
          ref={dropdownRef}
          className="absolute top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {searchList.map((user) => (
            <button
              type="button"
              key={user.userid}
              onClick={() => router.push(`/user/${user.username}`)}
              className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                {(user.username || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">@{user.username}</p>
                <p className="text-xs text-slate-500">Open profile</p>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const ProfileNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchList, setSearchList] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);

  const desktopLinks = useMemo(
    () => [
      { href: "/home", label: "Home", icon: House },
      { href: "/home?tab=trending", label: "Explore", icon: Flame },
      { href: "/bookmarks", label: "Saved", icon: Bookmark },
      { href: "/profile", label: "Profile", icon: UserRound },
      { href: "/follow-requests", label: "Requests", icon: Users, badge: requestCount || null },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
    [requestCount]
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

  useEffect(() => {
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

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex min-h-[4.75rem] items-center gap-3 py-3">
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

            <nav className="hidden items-center gap-2 pl-2 xl:flex">
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

            <div className="hidden lg:block ml-auto w-full max-w-md">
              <SearchInput
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchList={searchList}
                setSearchList={setSearchList}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
              />
            </div>

            <div className="ml-auto hidden items-center gap-2 lg:flex">
              <Link
                href="/createpost"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <PenSquare className="h-4 w-4" />
                Write
              </Link>
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

            <div className="ml-auto flex items-center gap-2 lg:hidden">
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
            />
          </div>
        </div>
      </header>

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

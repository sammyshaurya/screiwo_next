"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const FollowingsList = ({ handleFollowingClick, user = null }) => {
  const [followings, setFollowings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [privacyBlocked, setPrivacyBlocked] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchFollowings = async () => {
      try {
        setIsLoading(true);
        const searchParams = user ? `?username=${encodeURIComponent(user)}` : "";
        const response = await fetch(`/api/profile/follow/followings${searchParams}`);

        if (!response.ok) {
          if (response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            if (isMounted) {
              setPrivacyBlocked(true);
              setMessage(errorData?.message || "Following list is private for this profile.");
              setFollowings([]);
            }
            return;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (isMounted) {
          setFollowings(Array.isArray(data) ? data : []);
          setPrivacyBlocked(false);
          setMessage("");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        if (isMounted) {
          setFollowings([]);
          setPrivacyBlocked(false);
          setMessage("");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFollowings();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/80" />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md overflow-hidden border border-slate-800 bg-slate-900 shadow-[0_30px_90px_rgba(2,6,23,0.6)]">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Discovery
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">Following</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Creators and thinkers this profile follows.
                </p>
              </div>
              <button
                onClick={handleFollowingClick}
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center border border-slate-700 text-slate-400 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                aria-label="Close following list"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[24rem] space-y-3 overflow-y-auto px-6 py-5">
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 border border-slate-800 p-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}

            {!isLoading && followings.length === 0 && (
              <div className="border border-dashed border-slate-700 bg-slate-950 px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center bg-slate-900 shadow-sm">
                  <Compass className="h-5 w-5 text-slate-300" />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">
                  {privacyBlocked ? "Following list is private" : "Not following anyone yet"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {privacyBlocked
                    ? message || "This profile has chosen to keep following details private."
                    : "Once this profile starts following others, they’ll appear here."}
                </p>
              </div>
            )}

            {!isLoading &&
              followings.map((profile) => (
                <Link
                className="flex items-center justify-between border border-slate-800 p-3 transition hover:border-slate-600 hover:bg-slate-800"
                  key={profile.userid || profile.username}
                  href={`/user/${profile.username}`}
                  onClick={handleFollowingClick}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-white text-sm font-semibold text-slate-950">
                        {(profile.username || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">@{profile.username}</p>
                      <p className="text-sm text-slate-400">
                        {[profile.FirstName, profile.LastName].filter(Boolean).join(" ") || "View profile"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-500">View</span>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FollowingsList;

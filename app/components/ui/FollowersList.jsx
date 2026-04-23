"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const FollowersList = ({ handleFollowersClick, user = null }) => {
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [privacyBlocked, setPrivacyBlocked] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchFollowers = async () => {
      try {
        setIsLoading(true);
        const searchParams = user ? `?username=${encodeURIComponent(user)}` : "";
        const response = await fetch(`/api/profile/follow/followers${searchParams}`);

        if (!response.ok) {
          if (response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            if (isMounted) {
              setPrivacyBlocked(true);
              setMessage(errorData?.message || "Followers are private for this profile.");
              setFollowers([]);
            }
            return;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (isMounted) {
          setFollowers(Array.isArray(data) ? data : []);
          setPrivacyBlocked(false);
          setMessage("");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        if (isMounted) {
          setFollowers([]);
          setPrivacyBlocked(false);
          setMessage("");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFollowers();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/50" />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md overflow-hidden border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Community
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">Followers</h3>
                <p className="mt-2 text-sm text-slate-500">
                  People who want to keep up with this profile.
                </p>
              </div>
              <button
                onClick={handleFollowersClick}
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                aria-label="Close followers list"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[24rem] space-y-3 overflow-y-auto px-6 py-5">
            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 border border-gray-100 p-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}

            {!isLoading && followers.length === 0 && (
              <div className="border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center bg-white shadow-sm">
                  <Users className="h-5 w-5 text-slate-500" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-900">
                  {privacyBlocked ? "Followers are private" : "No followers yet"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {privacyBlocked
                    ? message || "This profile has chosen to keep follower details private."
                    : "Once people start following this profile, they’ll show up here."}
                </p>
              </div>
            )}

            {!isLoading &&
              followers.map((follower) => (
                <Link
                  className="flex items-center justify-between border border-gray-100 p-3 transition hover:border-gray-200 hover:bg-gray-50"
                  key={follower.userid || follower.username}
                  href={`/user/${follower.username}`}
                  onClick={handleFollowersClick}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={follower.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-slate-950 text-sm font-semibold text-white">
                        {(follower.username || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-950">@{follower.username}</p>
                      <p className="text-sm text-slate-500">
                        {[follower.FirstName, follower.LastName].filter(Boolean).join(" ") || "View profile"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-400">View</span>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FollowersList;

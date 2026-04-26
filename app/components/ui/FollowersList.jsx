"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, X, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { removeFollower as removeFollowerApi } from "@/app/lib/api";

const FollowersList = ({ handleFollowersClick, user = null, ownerId = null, viewerIsOwner = false, onMutate = null }) => {
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [privacyBlocked, setPrivacyBlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [isRemoving, setIsRemoving] = useState(null);

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

  const handleRemoveFollower = async (follower) => {
    if (!viewerIsOwner || !ownerId || !follower?.userid) {
      return;
    }

    try {
      setIsRemoving(follower.userid);
      await removeFollowerApi(ownerId, follower.userid);
      setFollowers((current) => current.filter((item) => item.userid !== follower.userid));
      await onMutate?.();
    } catch (error) {
      console.error("Failed to remove follower:", error);
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/80" />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md overflow-hidden border border-slate-800 bg-slate-900 shadow-[0_30px_90px_rgba(2,6,23,0.6)]">
          <div className="border-b border-slate-800 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Community
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">Followers</h3>
                <p className="mt-2 text-sm text-slate-400">
                  People who want to keep up with this profile.
                </p>
              </div>
              <button
                onClick={handleFollowersClick}
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center border border-slate-700 text-slate-400 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                aria-label="Close followers list"
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

            {!isLoading && followers.length === 0 && (
              <div className="border border-dashed border-slate-700 bg-slate-950 px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center bg-slate-900 shadow-sm">
                  <Users className="h-5 w-5 text-slate-300" />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">
                  {privacyBlocked ? "Followers are private" : "No followers yet"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {privacyBlocked
                    ? message || "This profile has chosen to keep follower details private."
                    : "Once people start following this profile, they’ll show up here."}
                </p>
              </div>
            )}

            {!isLoading &&
              followers.map((follower) => (
                <div
                  className="flex items-center justify-between border border-slate-800 p-3 transition hover:border-slate-600 hover:bg-slate-800"
                  key={follower.userid || follower.username}
                >
                  <Link
                    href={`/user/${follower.username}`}
                    onClick={handleFollowersClick}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={follower.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-white text-sm font-semibold text-slate-950">
                        {(follower.username || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-white">@{follower.username}</p>
                      <p className="truncate text-sm text-slate-400">
                        {[follower.FirstName, follower.LastName].filter(Boolean).join(" ") || "View profile"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-500">View</span>
                  </Link>
                  {viewerIsOwner ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveFollower(follower)}
                      disabled={isRemoving === follower.userid}
                      className="ml-3 inline-flex h-9 items-center gap-2 rounded-full border border-slate-700 px-3 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isRemoving === follower.userid ? "Removing..." : "Remove"}
                    </button>
                  ) : null}
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FollowersList;

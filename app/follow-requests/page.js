"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import { acceptFollowRequest, declineFollowRequest, getFollowRequests } from "@/app/lib/api";
import toast, { Toaster } from "react-hot-toast";
import { Check, CircleX, Users } from "lucide-react";

function displayName(user) {
  return [user?.FirstName, user?.LastName].filter(Boolean).join(" ") || user?.username || "Writer";
}

export default function FollowRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getFollowRequests();
      setRequests(Array.isArray(data?.requests) ? data.requests : []);
    } catch (error) {
      console.error("Failed to load follow requests:", error);
      toast.error("Could not load follow requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestUser) => {
    try {
      setBusyId(requestUser.userid);
      await acceptFollowRequest(requestUser.userid);
      toast.success("Follow request accepted.");
      setRequests((current) => current.filter((item) => item.userid !== requestUser.userid));
    } catch (error) {
      console.error("Failed to accept request:", error);
      toast.error(error?.message || "Could not accept request.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (requestUser) => {
    try {
      setBusyId(requestUser.userid);
      await declineFollowRequest(requestUser.userid);
      toast.success("Follow request declined.");
      setRequests((current) => current.filter((item) => item.userid !== requestUser.userid));
    } catch (error) {
      console.error("Failed to decline request:", error);
      toast.error(error?.message || "Could not decline request.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <ProfileNav />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6 lg:px-8">
        <section className="border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-7 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Inbox
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
              Follow requests
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-gray-600">
              Review private profile requests here and approve the readers you want to let in.
            </p>
          </div>

          <div className="p-6 md:p-8">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4 border border-gray-200 p-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="border border-dashed border-gray-300 bg-white px-8 py-16 text-center">
                <Users className="mx-auto h-8 w-8 text-gray-400" />
                <h2 className="mt-4 text-xl font-bold text-gray-950">No pending requests</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
                  When someone requests access to your private profile, it will appear here for review.
                </p>
                <Link
                  href="/settings"
                  className="mt-6 inline-flex h-10 items-center border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50"
                >
                  Review privacy settings
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.userid}
                    className="flex flex-col gap-4 border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <Link href={`/user/${request.username}`} className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border border-gray-200">
                        <AvatarImage src={request.profileImageUrl || undefined} />
                        <AvatarFallback className="bg-slate-950 text-white">
                          {displayName(request).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-base font-semibold text-gray-950">{displayName(request)}</p>
                        <p className="text-sm text-gray-500">@{request.username}</p>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-gray-600">
                          {request.Bio || "This reader has requested access to your private profile."}
                        </p>
                      </div>
                    </Link>
                    <div className="flex flex-wrap gap-3 md:justify-end">
                      <button
                        type="button"
                        onClick={() => handleAccept(request)}
                        disabled={busyId === request.userid}
                        className="inline-flex h-10 items-center gap-2 bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecline(request)}
                        disabled={busyId === request.userid}
                        className="inline-flex h-10 items-center gap-2 border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CircleX className="h-4 w-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Toaster />
    </div>
  );
}

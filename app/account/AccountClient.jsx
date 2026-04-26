"use client";

import { useEffect } from "react";
import { SignedIn, SignedOut, UserProfile, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { clerkUserProfileProps } from "@/app/lib/clerkConfig";

export default function AccountClient() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="app-page min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-panel rounded-[28px] border border-white/10 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6">
          <p className="app-kicker">Account</p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Manage identity, security, and sessions
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Keep your login methods, sessions, and public account details in one secure place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="app-chip">Security</span>
              <span className="app-chip">Identity</span>
              <span className="app-chip">Sessions</span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-black/60 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-4">
          <SignedIn>
            <UserProfile {...clerkUserProfileProps} />
          </SignedIn>
          <SignedOut>
            <div className="px-4 py-10 text-center text-sm text-slate-300">
              Redirecting to the landing page...
            </div>
          </SignedOut>
        </section>
      </main>
    </div>
  );
}

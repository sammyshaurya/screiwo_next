"use client";
import { SignedOut, SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/app/lib/clerkConfig";

export default function Signin() {  
  
  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <SignedOut>
        <div className="app-panel mx-auto w-full max-w-md overflow-hidden rounded-[28px] border border-white/10">
          <div className="border-b border-white/10 bg-black/70 px-5 py-6 text-left sm:px-6">
            <p className="app-kicker">Welcome back</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Sign in to Screiwo
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/60">
              Pick up reading, writing, and following creators without losing your place.
            </p>
          </div>
          <div className="bg-black/50 p-3 sm:p-4">
            <div className="overflow-hidden rounded-[22px]">
              <SignIn routing="hash" appearance={clerkAppearance} />
            </div>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}

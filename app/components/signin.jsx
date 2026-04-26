"use client";
import { SignedOut, SignIn } from "@clerk/nextjs";

export default function Signin() {  
  
  return (
    <div className="w-full">
      <SignedOut>
        <div className="app-panel mx-auto w-full max-w-md overflow-hidden rounded-[28px]">
          <div className="border-b border-slate-800/80 bg-slate-950/70 px-6 py-7 text-left">
            <p className="app-kicker">Welcome back</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Sign in to Screiwo
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Continue reading, writing, and following creators in a clean, focused space.
            </p>
          </div>
          <div className="bg-slate-950/50 p-4">
            <SignIn routing="hash" />
          </div>
        </div>
      </SignedOut>
    </div>
  );
}

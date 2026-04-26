"use client";
import React from "react";
import Signin from "./components/signin";

export default function Home() {
  return (
    <div className="app-page">
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
          <div className="max-w-2xl">
            <p className="app-kicker">Screiwo</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Write, read, and follow in one calm, premium space.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              A monochrome-first social publishing app built for focused reading, polished profile pages, and a fast creator workflow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-400">
              <span className="app-chip">Editorial profiles</span>
              <span className="app-chip">Fast reading</span>
              <span className="app-chip">Realtime social updates</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <Signin />
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUiPreferences } from "@/app/lib/uiPreferences";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  PROFILE_AVATAR_CLASS,
  PROFILE_AVATAR_FALLBACK_CLASS,
  PROFILE_BIO_CLASS,
  PROFILE_HERO_HEADER_CLASS,
  PROFILE_HERO_HEADER_COMPACT_CLASS,
  PROFILE_META_CHIP_CLASS,
  PROFILE_SNAPSHOT_CARD_CLASS,
  PROFILE_SNAPSHOT_GRID_CLASS,
  PROFILE_SNAPSHOT_HINT_CLASS,
  PROFILE_SNAPSHOT_LABEL_CLASS,
  PROFILE_SNAPSHOT_SECTION_CLASS,
  PROFILE_SNAPSHOT_VALUE_CLASS,
  PROFILE_SECTION_CLASS,
  PROFILE_SUBTITLE_CLASS,
  PROFILE_TITLE_CLASS,
} from "@/app/components/profile/profileStyles";

function formatJoined(dateValue) {
  if (!dateValue) {
    return "Recently joined";
  }

  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function ProfileShell({
  profile,
  profileTypeLabel = "Writer",
  title,
  subtitle,
  bio,
  featuredPost = null,
  activitySnapshot = [],
  badgeLabel,
  badgeHref = null,
  actions = [],
  statCards = [],
  tabs = [],
  activeTab,
  onTabChange,
  sidebarTop,
  sidebarBottom,
  children,
  emptyState,
  isEmpty = false,
}) {
  const displayName = title || [profile?.FirstName, profile?.LastName].filter(Boolean).join(" ") || "Writer";
  const initials = (profile?.username || "U").charAt(0).toUpperCase();
  const uiPrefs = getUiPreferences();
  const compactMode = Boolean(profile?.preferences?.compactMode ?? uiPrefs.compactMode);
  const showProfileDetails = profile?.preferences?.showProfileDetails !== false;
  const websiteUrl = profile?.website
    ? profile.website.startsWith("http://") || profile.website.startsWith("https://")
      ? profile.website
      : `https://${profile.website}`
    : null;

  const detailChips = [
    showProfileDetails && profile?.website ? { label: "Website", href: websiteUrl } : null,
    showProfileDetails && profile?.location ? { label: profile.location } : null,
    profile?.profileType ? { label: profile.profileType } : null,
    profile?.createdAt ? { label: `Joined ${formatJoined(profile.createdAt)}` } : null,
  ].filter(Boolean);

  const snapshotContent = activitySnapshot.length > 0 ? (
    <section className={PROFILE_SECTION_CLASS}>
      <div className={PROFILE_SNAPSHOT_SECTION_CLASS}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Activity snapshot
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
              A quick read on what is happening now
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm leading-6 text-slate-600 md:block">
            Compact signals that help readers and creators understand the profile at a glance.
          </p>
        </div>

        <div className={`mt-5 ${PROFILE_SNAPSHOT_GRID_CLASS}`}>
          {activitySnapshot.map((item) =>
            item.href ? (
              <Link key={item.label} href={item.href} className={PROFILE_SNAPSHOT_CARD_CLASS}>
                <p className={PROFILE_SNAPSHOT_LABEL_CLASS}>{item.label}</p>
                <div>
                  <p className={PROFILE_SNAPSHOT_VALUE_CLASS}>{item.value}</p>
                  {item.hint ? <p className={PROFILE_SNAPSHOT_HINT_CLASS}>{item.hint}</p> : null}
                </div>
              </Link>
            ) : item.onClick ? (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={`${PROFILE_SNAPSHOT_CARD_CLASS} text-left`}
              >
                <p className={PROFILE_SNAPSHOT_LABEL_CLASS}>{item.label}</p>
                <div>
                  <p className={PROFILE_SNAPSHOT_VALUE_CLASS}>{item.value}</p>
                  {item.hint ? <p className={PROFILE_SNAPSHOT_HINT_CLASS}>{item.hint}</p> : null}
                </div>
              </button>
            ) : (
              <div key={item.label} className={PROFILE_SNAPSHOT_CARD_CLASS}>
                <p className={PROFILE_SNAPSHOT_LABEL_CLASS}>{item.label}</p>
                <div>
                  <p className={PROFILE_SNAPSHOT_VALUE_CLASS}>{item.value}</p>
                  {item.hint ? <p className={PROFILE_SNAPSHOT_HINT_CLASS}>{item.hint}</p> : null}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  ) : null;

  return (
    <div className="space-y-8">
      <section className={PROFILE_SECTION_CLASS}>
        <div className={compactMode ? PROFILE_HERO_HEADER_COMPACT_CLASS : PROFILE_HERO_HEADER_CLASS}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar className={PROFILE_AVATAR_CLASS}>
                <AvatarImage src={profile?.profileImageUrl || undefined} />
                <AvatarFallback className={PROFILE_AVATAR_FALLBACK_CLASS}>
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="max-w-2xl">
                <p className={PROFILE_SUBTITLE_CLASS}>{profileTypeLabel}</p>
                <h1 className={`mt-2 ${PROFILE_TITLE_CLASS}`}>{displayName}</h1>
                {subtitle ? <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p> : null}
                <p className={PROFILE_BIO_CLASS}>
                  {bio || "No bio yet. Add a short introduction so readers know what you write about."}
                </p>

                {detailChips.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {detailChips.map((chip) =>
                      chip.href ? (
                        <a
                          key={chip.label}
                          href={chip.href}
                          target="_blank"
                          rel="noreferrer"
                          className={PROFILE_META_CHIP_CLASS}
                        >
                          {chip.label}
                        </a>
                      ) : (
                        <span key={chip.label} className={PROFILE_META_CHIP_CLASS}>
                          {chip.label}
                        </span>
                      )
                    )}
                  </div>
                ) : null}

                {badgeLabel ? (
                  <div className="mt-4">
                    {badgeHref ? (
                      <Link href={badgeHref} className="text-sm font-semibold text-slate-950 hover:text-slate-700">
                        {badgeLabel}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-slate-950">{badgeLabel}</span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {actions.length > 0 ? (
              <div className="-mx-1 flex w-full gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:w-auto xl:grid-cols-2">
                {actions.map((action) =>
                  action.href ? (
                    <Link
                      key={action.label}
                      href={action.href}
                      aria-disabled={action.loading ? "true" : undefined}
                      className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition sm:w-full ${
                        action.loading ? "pointer-events-none opacity-70" : ""
                      } ${action.className || "bg-slate-950 text-white hover:bg-slate-800"}`}
                    >
                      {action.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : action.icon}
                      {action.loading ? action.loadingLabel || "Working..." : action.label}
                    </Link>
                  ) : (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      type="button"
                      disabled={action.disabled || action.loading}
                      aria-busy={action.loading ? "true" : undefined}
                      className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition sm:w-full ${
                        action.loading ? "cursor-wait opacity-70" : ""
                      } ${action.className || "border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      {action.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : action.icon}
                      {action.loading ? action.loadingLabel || "Working..." : action.label}
                    </button>
                  )
                )}
              </div>
            ) : null}
          </div>
        </div>

        {statCards.length > 0 ? (
          <div className="grid grid-cols-2 divide-y divide-slate-100 border-t border-slate-200 md:grid-cols-4 md:divide-x md:divide-y-0">
            {statCards.map((stat) =>
              stat.onClick ? (
                <button
                  key={stat.label}
                  type="button"
                  onClick={stat.onClick}
                  className="px-6 py-5 text-left transition hover:bg-slate-50"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{stat.value}</p>
                  {stat.hint ? <p className="mt-1 text-xs text-slate-500">{stat.hint}</p> : null}
                </button>
              ) : (
                <div key={stat.label} className="px-6 py-5 text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{stat.value}</p>
                  {stat.hint ? <p className="mt-1 text-xs text-slate-500">{stat.hint}</p> : null}
                </div>
              )
            )}
          </div>
        ) : null}
      </section>

      {featuredPost?.href || featuredPost?.title ? (
        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="flex flex-col justify-between gap-4 p-5 md:p-6">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Featured post
                </p>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  {featuredPost.title}
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-slate-600">
                  {featuredPost.excerpt || "A highlighted post gives visitors a fast way to understand your writing style."}
                </p>
              </div>
              {featuredPost.href ? (
                <Link
                  href={featuredPost.href}
                  className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-950 hover:text-slate-600"
                >
                  Read featured post
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
            {featuredPost.coverImageUrl ? (
              <div className="relative min-h-[180px] border-t border-slate-200 md:border-l md:border-t-0">
                <img
                  src={featuredPost.coverImageUrl}
                  alt={featuredPost.title || "Featured post"}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="hidden min-h-[180px] items-end justify-start border-t border-slate-200 bg-slate-950 p-5 text-white md:flex md:border-l md:border-t-0">
                <p className="max-w-sm text-sm leading-7 text-slate-300">
                  Featured writing will appear here once a post is selected.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <div className="hidden md:block">{snapshotContent}</div>

      {tabs.length > 0 ? (
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className={`border-b-2 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-slate-950 text-slate-950"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-950"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      ) : null}

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          {isEmpty ? emptyState : children}
        </div>

        <aside className="space-y-4">
          {sidebarTop}
          {sidebarBottom}
        </aside>
      </section>

      <div className="md:hidden">{snapshotContent}</div>
    </div>
  );
}

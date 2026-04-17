"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUiPreferences } from "@/app/lib/uiPreferences";
import {
  PROFILE_AVATAR_CLASS,
  PROFILE_AVATAR_FALLBACK_CLASS,
  PROFILE_HERO_HEADER_CLASS,
  PROFILE_HERO_HEADER_COMPACT_CLASS,
} from "@/app/components/profile/profileStyles";

export default function ProfileShell({
  profile,
  profileTypeLabel = "Writer",
  title,
  subtitle,
  bio,
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

  return (
    <div className="space-y-8">
      <section className="border border-gray-200 bg-white shadow-sm">
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
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                  {profileTypeLabel}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
                  {displayName}
                </h1>
                {subtitle ? <p className="mt-1 text-base text-gray-500">{subtitle}</p> : null}
                <p className="mt-5 max-w-2xl border-l-2 border-gray-200 pl-4 text-base leading-7 text-gray-700">
                  {bio || "No bio yet. Add a short introduction so readers know what you write about."}
                </p>
                {badgeLabel ? (
                  <div className="mt-4">
                    {badgeHref ? (
                      <Link
                        href={badgeHref}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                      >
                        {badgeLabel}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-blue-700">{badgeLabel}</span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {actions.map((action) =>
                action.href ? (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold transition ${action.className || "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    {action.icon}
                    {action.label}
                  </Link>
                ) : (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    type="button"
                    disabled={action.disabled}
                    className={`inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold transition ${action.className || "border border-gray-300 bg-white text-gray-800 hover:border-gray-400 hover:bg-gray-50"}`}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

      {statCards.length > 0 ? (
        <div className="grid divide-y divide-gray-100 md:grid-cols-4 md:divide-x md:divide-y-0">
            {statCards.map((stat) => (
              <button
                key={stat.label}
                type="button"
                onClick={stat.onClick}
                className="px-6 py-5 text-left transition hover:bg-gray-50"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-950">{stat.value}</p>
                {stat.hint ? <p className="mt-1 text-xs text-gray-500">{stat.hint}</p> : null}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {tabs.length > 0 ? (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className={`border-b-2 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900"
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
    </div>
  );
}

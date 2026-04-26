export const clerkAppearance = {
  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "iconButton",
    termsPageUrl: "/",
    helpPageUrl: "/",
  },
  variables: {
    colorPrimary: "#ffffff",
    colorText: "#f8fafc",
    colorTextSecondary: "#94a3b8",
    colorBackground: "#05070d",
    colorInputBackground: "rgba(255,255,255,0.04)",
    colorInputText: "#f8fafc",
    colorInputBorder: "rgba(255,255,255,0.12)",
    colorNeutral: "#0f172a",
    colorShimmer: "rgba(255,255,255,0.08)",
    borderRadius: "18px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full max-w-full",
    card: "w-full max-w-full overflow-hidden border border-white/10 bg-[#05070d] text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
    cardBox: "w-full max-w-full",
    headerTitle: "text-white",
    headerSubtitle: "text-white/60",
    socialButtonsBlockButton:
      "h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/10",
    socialButtonsBlockButtonText: "text-sm font-semibold text-white",
    formButtonPrimary:
      "h-11 rounded-xl bg-white text-black hover:bg-white/90",
    formFieldInput:
      "h-11 rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder:text-white/35 focus:border-white/25 focus:ring-white/20",
    formFieldLabel: "text-xs font-semibold uppercase tracking-[0.24em] text-white/45",
    formFieldHintText: "text-white/50",
    formFieldErrorText: "text-red-300",
    footerActionLink: "text-white hover:text-white/80",
    identityPreviewText: "text-white/60",
    otpCodeFieldInput:
      "h-11 rounded-xl border border-white/10 bg-white/[0.03] text-white focus:border-white/25 focus:ring-white/20",
    dividerLine: "bg-white/10",
    main: "w-full",
    userButtonBox: "rounded-full",
    userButtonOuterIdentifier: "rounded-full",
    userButtonTrigger:
      "rounded-full border border-white/10 bg-white/[0.04] text-white shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:border-white/20 hover:bg-white/[0.08]",
    userButtonAvatarBox: "rounded-full",
    userButtonAvatarImage: "rounded-full",
    userButtonPopoverRootBox: "z-[100] drop-shadow-[0_20px_60px_rgba(0,0,0,0.45)]",
    userButtonPopoverCard:
      "min-w-[18rem] overflow-hidden rounded-[24px] border border-white/10 bg-[#05070d] text-white shadow-[0_28px_90px_rgba(0,0,0,0.5)]",
    userButtonPopoverMain: "bg-[#05070d] p-2",
    userButtonPopoverActions:
      "space-y-1 border-t border-white/10 bg-[#05070d] p-2",
    userButtonPopoverActionButton:
      "h-10 rounded-xl px-3 text-sm font-medium text-white/90 hover:bg-white/[0.08] hover:text-white",
    userButtonPopoverActionButtonIconBox:
      "rounded-lg bg-white/[0.05] text-white/80",
    userButtonPopoverActionButtonIcon:
      "h-4 w-4 text-white/80",
    userButtonPopoverCustomItemButton:
      "h-10 rounded-xl px-3 text-sm font-medium text-white/90 hover:bg-white/[0.08] hover:text-white",
    userButtonPopoverCustomItemButtonIconBox:
      "rounded-lg bg-white/[0.05] text-white/80",
    userButtonPopoverActionItemButtonIcon:
      "h-4 w-4 text-white/80",
    userButtonPopoverFooter:
      "border-t border-white/10 bg-[#05070d] px-3 py-2",
    userButtonPopoverFooterPagesLink: "text-white/60 hover:text-white",
  },
};

export const clerkUserButtonProps = {
  appearance: clerkAppearance,
  afterSignOutUrl: "/",
  userProfileMode: "navigation",
  userProfileUrl: "/account",
  customMenuItems: [
    { label: "Profile", href: "/profile" },
    { label: "Settings", href: "/settings" },
    { label: "Bookmarks", href: "/bookmarks" },
    { label: "Follow requests", href: "/follow-requests" },
    { label: "Write a post", href: "/createpost" },
  ],
};

export const clerkUserProfileProps = {
  routing: "path",
  path: "/account",
  appearance: clerkAppearance,
};

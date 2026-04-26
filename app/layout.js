import "./globals.css";
import Provider from "./provider";
import {
  ClerkProvider,
} from "@clerk/nextjs";
import { clerkAppearance } from "./lib/clerkConfig";

export const metadata = {
  title: "Screiwo",
  description: "Screiwo everyone",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={clerkAppearance}
    >
      <html lang="en" className="dark">
      <head>
        <link rel="dns-prefetch" href="https://img.clerk.com" />
        <link rel="preconnect" href="https://settled-pangolin-47.clerk.accounts.dev" />
      </head>
        <body className="h-full bg-slate-950 pb-24 text-slate-100 antialiased lg:pb-0">
          <Provider>{children}</Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}

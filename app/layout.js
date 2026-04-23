import "./globals.css";
import Provider from "./provider";
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";

export const metadata = {
  title: "Screiwo",
  description: "Screiwo everyone",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
      <head>
        <link rel="dns-prefetch" href="https://img.clerk.com" />
        <link rel="preconnect" href="https://settled-pangolin-47.clerk.accounts.dev" />
      </head>
        <body className="h-full pb-24 antialiased lg:pb-0">
          <Provider>{children}</Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}

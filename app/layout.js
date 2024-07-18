import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Screiwo",
  description: "Screiwo everyone",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} h-full`}>
          <Provider>{children}</Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}

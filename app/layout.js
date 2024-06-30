import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "./provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Screiwo",
  description: "Screiwo everyone",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} h-full`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}

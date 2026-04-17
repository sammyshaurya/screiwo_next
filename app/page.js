"use client";
import React from "react";
import Signin from "./components/signin";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Screiwo
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Connect with friends and the world around you on Screiwo.
          </p>
          <Signin />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-50 to-gray-100 py-2">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 mb-2">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Help</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Advertising</a>
            <a href="#" className="hover:underline">Business</a>
          </div>
          <p className="text-xs text-gray-500 text-center">
            &copy; 2025 Screiwo. Created by{" "}
            <a
              href="https://twitter.com/sammy_shaurya"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sammy Shaurya
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
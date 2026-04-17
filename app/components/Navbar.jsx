import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Home,
  Search,
  Plus,
  Bell,
  MessageCircle,
  User,
  Menu,
  X,
  Bookmark
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/svg/logo.svg" alt="Scriewo" width={32} height={32} />
              <span className="text-xl font-bold text-gray-900">Scriewo</span>
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search users, posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-1 h-8 w-full border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedIn>
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Home className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/createpost">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Plus className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/bookmarks">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Bookmark className="w-5 h-5" />
                </Button>
              </Link>
              <NotificationDropdown />
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <MessageCircle className="w-5 h-5" />
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link href="/signup">
                <Button variant="outline" size="sm">
                  Sign Up
                </Button>
              </Link>
              <Link href="/signin">
                <Button size="sm">
                  Sign In
                </Button>
              </Link>
            </SignedOut>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <SignedIn>
              <div className="flex flex-col space-y-2">
                <Link href="/" className="flex items-center space-x-2 px-2 py-2 text-gray-600 hover:text-gray-900">
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link href="/createpost" className="flex items-center space-x-2 px-2 py-2 text-gray-600 hover:text-gray-900">
                  <Plus className="w-5 h-5" />
                  <span>Create Post</span>
                </Link>
                <Link href="/bookmarks" className="flex items-center space-x-2 px-2 py-2 text-gray-600 hover:text-gray-900">
                  <Bookmark className="w-5 h-5" />
                  <span>Bookmarks</span>
                </Link>
                <Link href="/notifications" className="flex items-center space-x-2 px-2 py-2 text-gray-600 hover:text-gray-900">
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </Link>
                <Link href="/profile" className="flex items-center space-x-2 px-2 py-2 text-gray-600 hover:text-gray-900">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <div className="px-2 py-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex flex-col space-y-2">
                <Link href="/signup" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
                <Link href="/signin" className="w-full">
                  <Button size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </SignedOut>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

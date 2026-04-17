"use client";
import React, { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import LeftSidebar from "./Leftspan";
import RightSidebar from "./Rightspan";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import axios from "axios";
import Postcard from "./Postcard";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = React.useState([]);
  const [isLoading, setLoading] = React.useState(true);

  // Verify auth and redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/');
    }
  }, [isLoaded, userId, router]);

  // Only fetch data once auth is verified
  useEffect(() => {
    if (!isLoaded || !userId) return;
    
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/users/feed");
        setPosts(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoaded, userId]);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <ProfileNav />
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 px-4 py-6 max-w-7xl">
        {/* Left Sidebar */}
        <div className="hidden md:block md:col-span-3">
          <div className="sticky top-20 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 rounded" />
                <Skeleton className="h-8 w-2/3 rounded" />
                <Skeleton className="h-8 w-3/4 rounded" />
                <Skeleton className="h-8 w-2/3 rounded" />
              </div>
            ) : (
              <LeftSidebar />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 md:col-span-6">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3 bg-white p-4 rounded-lg">
                  <Skeleton className="h-40 w-full rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              <Postcard posts={posts} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center bg-white rounded-lg p-8">
              <div className="text-5xl">📭</div>
              <div className="text-2xl font-bold text-gray-900">Your Feed is Empty</div>
              <div className="text-gray-600 max-w-sm">
                Start following interesting users to see their thoughts, stories, and insights here
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden md:block md:col-span-3">
          <div className="sticky top-20 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 rounded" />
                <Skeleton className="h-8 w-2/3 rounded" />
                <Skeleton className="h-8 w-3/4 rounded" />
                <Skeleton className="h-8 w-2/3 rounded" />
              </div>
            ) : (
              <RightSidebar />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

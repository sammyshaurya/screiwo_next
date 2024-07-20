"use client";
import React, { useEffect } from "react";
import LeftSidebar from "./Leftspan";
import RightSidebar from "./Rightspan";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import axios from "axios";
import Postcard from "./Postcard";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const [posts, setPosts] = React.useState([]);
  const [isLoading, setLoading] = React.useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div className="bg-gray-100 relative">
      <ProfileNav />
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-4">
        <div className="hidden md:block md:col-span-3 border-r-3">
          <div className="sticky top-20">
            <LeftSidebar />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6">
          {!posts.length && isLoading ? (
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[225px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-[225px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ) : posts.length > 0 ? (
            <Postcard posts={posts} />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 text-center text-gray-500">
              <div className="text-lg font-semibold">No feeds to show</div>
              <div className="text-sm">
                Follow some users to see their posts here
              </div>
            </div>
          )}
        </div>
        <div className="hidden md:block md:col-span-3 border-l-3">
          <div className="sticky top-20">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

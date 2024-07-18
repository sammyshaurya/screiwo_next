"use client";
import React, { useEffect } from "react";
import LeftSidebar from "./Leftspan";
import RightSidebar from "./Rightspan";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import axios from "axios";
import Postcard from "./Postcard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@clerk/nextjs";

const Home = () => {
  const [posts, setPosts] = React.useState();
  const [isloading, setLoading] = React.useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/users/feed");
        if (!response.data) {
          setLoading(false);
          return;
        }
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <ProfileNav />
      <div className="block md:hidden"></div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4">
        <div className="hidden md:block md:col-span-3">
          <LeftSidebar />
        </div>
        <div className="col-span-12 md:col-span-6 px-0">
          {!posts && isloading ? (
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
          ) : posts && posts.length > 0 ? (
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
        <div className="hidden md:block md:col-span-3">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default Home;

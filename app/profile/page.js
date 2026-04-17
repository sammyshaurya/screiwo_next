"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import Posts from "@/app/components/Pages/main/Posts";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import axios from "axios";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Users, UserPlus, FileText, Edit } from "lucide-react";
import { Divider } from "@nextui-org/divider";
import { Skeleton } from "@/components/ui/skeleton";
import FollowersList from "../components/ui/FollowersList";
import FollowingsList from "../components/ui/FollowingsList";

const Profile = () => {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

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
        const response = await axios.get("/api/profile") 
        setPosts(response.data.profile.posts);
        setUser(response.data.profile);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [isLoaded, userId]);

  const handleFollowersClick = () => {
    setShowFollowers(!showFollowers);
  };

  const handleFollowingClick = () => {
    setShowFollowing(!showFollowing);
  };


  return (
    <div className="bg-white min-h-screen">
      <ProfileNav />
      <div className="container mx-auto p-4 max-w-6xl">
        {!user ? (
          <div className="mb-4 p-4">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600 font-bold">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 md:mb-0">{user.username}</h1>
                  <Link href="/createpost">
                    <Button
                      size="sm"
                      color="primary"
                      variant="solid"
                      startContent={<Edit className="w-4 h-4" />}
                      className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm"
                    >
                      Create Post
                    </Button>
                  </Link>
                </div>
                <div className="flex justify-center md:justify-start space-x-6 mb-3">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FileText className="w-4 h-4" />
                    <span className="font-semibold text-base">{posts?.length || 0}</span>
                    <span className="text-sm">posts</span>
                  </div>
                  <div
                    className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={handleFollowersClick}
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-semibold text-base">{user.Followers}</span>
                    <span className="text-sm">followers</span>
                  </div>
                  <div
                    className="flex items-center space-x-2 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={handleFollowingClick}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="font-semibold text-base">{user.Followings}</span>
                    <span className="text-sm">following</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {user.FirstName} {user.LastName}
                  </h2>
                  <p className="text-sm text-gray-600 font-medium">{user.profileType}</p>
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {user.Bio || "Welcome to my profile! I love sharing ideas and connecting with others."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {showFollowers && (
          <FollowersList handleFollowersClick={handleFollowersClick} />
        )}
        {showFollowing && (
          <FollowingsList handleFollowingClick={handleFollowingClick} />
        )}
        <Divider className="my-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {!user ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <Skeleton className="h-48 w-full rounded-lg mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            posts?.map((post, index) => (
              <Posts key={index} post={post} profile={user} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

"use client";
import React, { useState, useEffect } from "react";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import Posts from "@/app/components/Pages/main/Posts";
import { Avatar } from "@nextui-org/avatar";
import axios from "axios";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { StretchVerticallyIcon } from "@radix-ui/react-icons";
import { Divider } from "@nextui-org/divider";
import { Skeleton } from "@/components/ui/skeleton";
import FollowersList from "../components/ui/FollowersList";
import FollowingsList from "../components/ui/FollowingsList";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Navigate("/");
          return;
        }
        const response = await axios.get("/api/profile", {
          headers: {
            Authorization: token,
          },
        });
        setPosts(response.data.profile.posts);
        setUser(response.data.profile);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);

  const handleFollowersClick = () => {
    setShowFollowers(!showFollowers);
  };

  const handleFollowingClick = () => {
    setShowFollowing(!showFollowing);
  };

  console.log(posts);

  return (
    <div className="bg-gray-100 min-h-screen">
      <ProfileNav />
      <div className="container mx-auto p-4">
        {!user ? (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-[250px] rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center md:flex-row md:items-start">
            <Avatar src="/defaultavatar.png" className="h-40 w-40" />
            <div className="flex flex-col ml-0 md:ml-8 mt-4 md:mt-0">
              <div className="flex justify-between w-full md:w-auto">
                <div className="username underline mb-3">
                  {user && user.username}
                </div>
                <Link href="/createpost">
                  <Button
                    size="sm"
                    color="primary"
                    variant="ghost"
                    radius="none"
                  >
                    <StretchVerticallyIcon />
                    Create Post
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col">
                <div className="flex mb-2">
                  <div>{posts && `${posts.length || 0} posts`}</div>
                  <div
                    className="ml-4 cursor-pointer"
                    onClick={handleFollowersClick}
                  >
                    {`${user.Followers} followers`}
                  </div>
                  {showFollowers && (
                    <FollowersList
                      handleFollowersClick={handleFollowersClick}
                    />
                  )}
                  {showFollowing && (
                    <FollowingsList
                      handleFollowingClick={handleFollowingClick}
                    />
                  )}
                  <div
                    className="ml-4 cursor-pointer"
                    onClick={handleFollowingClick}
                  >
                    {`${user.Followings} following`}
                  </div>
                </div>
                <h5 className="text-gray-700">
                  {user ? (
                    `${user.FirstName} ${user.LastName}`
                  ) : (
                    <Skeleton className="w-[100px] h-[20px] rounded-full" />
                  )}
                  <span className="ml-3 text-sm font-light text-slate-700">
                    {user && user.profileType}
                  </span>
                </h5>
                <blockquote className="border-l-2 pl-2 italic">
                  &quot;After all,&quot; he said, &quot;everyone enjoys a good
                  joke, so it&apos;s only fair that they should pay for the
                  privilege.&quot;
                </blockquote>
              </div>
            </div>
          </div>
        )}
        <Divider className="my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 grid-flow-dense">
          {!user && (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col space-y-3">
                  <Skeleton className="h-[225px] w-[350px] rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[350px]" />
                    <Skeleton className="h-4 w-[300px]" />
                  </div>
                </div>
              ))}
            </>
          )}

          {user &&
            posts &&
            posts.map((post, index) => (
                <Posts key={index} post={post} profile={user} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;

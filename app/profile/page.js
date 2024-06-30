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

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

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

  return (
    <div className="bg-gray-100 min-h-screen">
      <ProfileNav />
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center md:flex-row md:items-start">
          <Avatar src="/defaultavatar.png" className="h-40 w-40" />
          <div className="flex flex-col ml-0 md:ml-8 mt-4 md:mt-0">
            <div className="flex justify-between w-full md:w-auto">
              <div className="username underline mb-3">
                {user && user.username}
              </div>
              <Link href="/post">
                <Button size="sm" color="primary" variant="ghost" radius="none">
                  <StretchVerticallyIcon />
                  Create Post
                </Button>
              </Link>
            </div>
            <div className="flex flex-col">
              <div className="flex mb-2">
                <div>{`${posts.length || 0} posts`}</div>
                <div className="ml-4">{`0 followers`}</div>
                <div className="ml-4">{`0 following`}</div>
              </div>
              <h5 className="text-gray-700">
                {user && `${user.FirstName} ${user.LastName}`}
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
        <Divider className="my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user &&
            posts &&
            posts
              .slice()
              .reverse()
              .map((post, index) => (
                <Posts key={index} post={post} profile={user} />
              ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;

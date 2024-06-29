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
        const response = await axios.get(
          "/api/profile",
          {
            headers: {
              Authorization: token,
            },
          }
        );
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
      <div className="flex">
        <div className="flex-1 h-full ">
          <div className="mx-36 mt-6 flex flex-col items-start">
            <div className="flex items-center">
              <Avatar
                src="/defaultavatar.png"
                className="flex h-40 w-40"
              ></Avatar>
              <div className="flex-col">
                <div className="flex justify-between">
                  <div className="username text-decoration-line: underline ml-16 mb-3">
                    {user && user.username}
                  </div>
                  <Link href="/post">
                    <Button>
                      <StretchVerticallyIcon />
                      Create Post
                    </Button>
                  </Link>
                </div>
                <div className="flex-col">
                  <div className="flex">
                    <div className="ml-16 mb-2">{`${posts.length || 0} posts`}</div>
                    <div className="ml-8 mb-2">{`0 followers`}</div>
                    <div className="ml-8 mb-2">{`0 following`}</div>
                  </div>
                  <h5 className="ml-16 mb-3 text-gray-700">
                    {user && user.FirstName + " " + user.LastName}
                    <span className="ml-3 text-wrap text-sm font-light text-slate-700 ">
                      {user && user.profileType}
                    </span>
                  </h5>
                  <blockquote className="ml-16 border-l-2 pl-2 italic">
                    &quot;After all,&quot; he said, &quot;everyone enjoys a good
                    joke, so it&apos;s only fair that they should pay for the
                    privilege.&quot;
                  </blockquote>
                </div>
              </div>
            </div>
            <Divider className="my-4" />
          </div>
          <div className="grid grid-cols-2 gap-4 mx-36 mb-10">
            {user && posts &&
              posts
                .slice()
                .reverse()
                .map((post, index) => (
                  <Posts key={index} post={post} profile={user} />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

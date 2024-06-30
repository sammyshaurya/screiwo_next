"use client";
import React from "react";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import Posts from "@/app/components/Pages/main/Posts";
import { Avatar } from "@nextui-org/avatar";
import axios from "axios";
import { Button } from "@nextui-org/button";
import { useEffect, useState } from "react";
import { Divider } from "@nextui-org/divider";
import toast, { Toaster } from "react-hot-toast";

const UsersProfile = ({ params }) => {
  const [curUser, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followed, setFollowed] = useState(false);

  const searchUser = params.username;

  const submitFollow = async (toFollow) => {
    try {
      const token = localStorage.getItem("token");
      const myID = localStorage.getItem("userObj");
      if (!token) {
        Navigate("/");
        return;
      }
      const response = await axios.post(`/api/profile/follow`, {
        headers: {
          Authorization: token,
        },
        params: {
          followUser: toFollow,
          followeeid: myID,
        },
      });
      if (response.status >= 200 && response.status < 300) {
        toast.success("Followed user");
        setFollowed(true);
      } else {
        setFollowed(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // useEffect(() => {
  //   if (curUser && !followed) {
  //     submitFollow(curUser.userid);
  //   }
  // }, [curUser, followed]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          Navigate("/");
          return;
        }
        const response = await axios.get(
          `/api/profile/usersprofile?username=${encodeURIComponent(
            searchUser
          )}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        const userProfile = response.data.userProfile;
        setFollowed(response.data.isFollowing);
        const userprofile = {
          Bio: userProfile.Bio,
          FirstName: userProfile.FirstName,
          Followers: userProfile.Followers,
          Followings: userProfile.Followings,
          LastName: userProfile.LastName,
          Posts: userProfile.Posts,
          dob: userProfile.dob,
          gender: userProfile.gender,
          postCount: userProfile.postCount,
          profileType: userProfile.profileType,
          username: userProfile.username,
          userid: userProfile.userid,
        };
        setPosts(userProfile.posts);
        setUser(userprofile);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [searchUser]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <ProfileNav />
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center md:flex-row md:items-start">
          <Avatar src="/defaultavatar.png" className="h-40 w-40" />
          <div className="flex flex-col ml-0 md:ml-8 mt-4 md:mt-0 w-full">
            <div className="flex justify-between items-center w-full">
              <div className="username underline mb-3">
                {curUser && curUser.username}
              </div>
              <div className="ml-auto">
                <Button
                  type="submit"
                  onClick={() => submitFollow(curUser.userid)}
                >
                  {followed ? "Following" : "Follow"}
                </Button>
              </div>
            </div>
            <div className="flex-col mt-4">
              <div className="flex mb-2">
                <div>{`${posts.length} posts`}</div>
                <div className="ml-4">
                  {curUser && `${curUser.Followers} followers`}
                </div>
                <div className="ml-4">
                  {curUser && `${curUser.Followings} following`}
                </div>
              </div>
              <h5 className="text-gray-700">
                {(curUser && curUser.FirstName + " " + curUser.LastName) || ""}
                <span className="ml-3 text-sm font-light text-slate-700">
                  {curUser && curUser.profileType}
                </span>
              </h5>
              <blockquote className="border-l-2 pl-2 italic mt-2">
                {curUser && curUser.username !== "sammyshaurya" ? (
                  <div dangerouslySetInnerHTML={{ __html: curUser.Bio }} />
                ) : (
                  <div>
                    &quot;After all,&quot; he said, &quot;everyone enjoys a good
                    joke, so it&apos;s only fair that they should pay for the
                    privilege.&quot;
                  </div>
                )}
              </blockquote>
            </div>
          </div>
        </div>
        <Divider className="my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts &&
            posts.map((post, index) => (
              <Posts key={index} post={post} profile={curUser} />
            ))}
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default UsersProfile;

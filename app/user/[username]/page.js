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
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import FollowersList from "@/app/components/ui/FollowersList";
import FollowingsList from "@/app/components/ui/FollowingsList";
import { useUser } from "@clerk/nextjs";

const UsersProfile = ({ params }) => {
  const [curUser, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followed, setFollowed] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const router = useRouter();
  const searchUser = params.username;
  const { user: clerkUser } = useUser();

  const submitFollow = async (toFollow) => {
    try {
      const response = await axios.post(
        "/api/profile/follow",
        {
          followUser: toFollow,
        },
      );
      console.log(response);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/api/profile/usersprofile?username=${encodeURIComponent(
            searchUser
          )}`,
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

  const handleFollowersClick = () => {
    setShowFollowers(!showFollowers);
  };

  const handleFollowingClick = () => {
    setShowFollowing(!showFollowing);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <ProfileNav />
      <div className="container mx-auto p-4">
        {!curUser ? (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-[250px] rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center md:flex-row md:items-start">
            <Avatar width={40} height={40} src={clerkUser?.imageUrl || "/defaultavatar.png"} className="h-40 w-40 min-w-40" />
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
                  <div>{posts && `${posts.length} posts`}</div>
                  <div className="ml-4 cursor-pointer" onClick={handleFollowersClick}>
                    {curUser && `${curUser.Followers} followers`}
                  </div>
                  {showFollowers && <FollowersList handleFollowersClick={handleFollowersClick} />}
                  {showFollowing && <FollowingsList handleFollowingClick={handleFollowingClick} />}
                  <div className="ml-4 cursor-pointer" onClick={handleFollowingClick}>
                    {curUser && `${curUser.Followings} following`}
                  </div>
                </div>
                <h5 className="text-gray-700">
                  {(curUser && curUser.FirstName + " " + curUser.LastName) ||
                    ""}
                  <span className="ml-3 text-sm font-light text-slate-700">
                    {curUser && curUser.profileType}
                  </span>
                </h5>
                <blockquote className="border-l-2 pl-2 italic mt-2">
                  {curUser && curUser.username !== "sammyshaurya" ? (
                    <div dangerouslySetInnerHTML={{ __html: curUser.Bio }} />
                  ) : (
                    <div>
                      &quot;After all,&quot; he said, &quot;everyone enjoys a
                      good joke, so it&apos;s only fair that they should pay for
                      the privilege.&quot;
                    </div>
                  )}
                </blockquote>
              </div>
            </div>
          </div>
        )}
        <Divider className="my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {!curUser && (
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

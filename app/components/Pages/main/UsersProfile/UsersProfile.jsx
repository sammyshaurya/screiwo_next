import React from "react";
import { ProfileNav } from "../ProfileNav";
import { Posts } from "../Posts";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/nextjs";

export const UsersProfile = () => {
  const [curUser, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const searchUser = useParams();
  const [followed, setFollowed] = useState(false);

  const { user: clerkUser } = useUser();

  const submitFollow = async (toFollow) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Navigate("/");
        return;
      }
      const response = await axios.get(
        `https://screiwo-backend.onrender.com/api/users/profile/follow`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
          params: {
            followUser: toFollow,
          },
        }
      );
      if (response.status === 200) {
        setFollowed(true);
        
      } else {
        setFollowed(false);
        console.log("error in following");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (curUser && !followed) {
      submitFollow(curUser.userid);
    }
  }, [curUser, followed]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Navigate("/");
          return;
        }
        const response = await axios.get(
          `/api/profile/usersprofile`,
          {
            params: {
              username: searchUser.username,
            },
          }
        );
        const userprofile = {
          Bio: response.data[0].Bio,
          FirstName: response.data[0].FirstName,
          Followers: response.data[0].Followers,
          Followings: response.data[0].Followings,
          LastName: response.data[0].LastName,
          Posts: response.data[0].Posts,
          dob: response.data[0].dob,
          gender: response.data[0].gender,
          postCount: response.data[0].postCount,
          profileType: response.data[0].profileType,
          username: response.data[0].username,
          userid: response.data[0].userid,
        };
        setPosts(response.data[0].posts);
        setUser(userprofile);

        // const fetchPosts = async () => {
        //   try {
        //     const response = await axios.get(
        //       "/api/screiwousersprofilepost",
        //       {
        //         params: { userid: userprofile.userid },
        //       }
        //     );
        //     setPosts(response.data);
        //   } catch (error) {
        //     console.error("Error fetching posts:", error);
        //   }
        // };

        // fetchPosts();
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [searchUser.username]);

  return (
    <div>
      <ProfileNav />
      <div className="flex">
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="mx-36 mt-6 flex flex-col items-start">
            <div className="flex items-center">
            <Avatar
                src={clerkUser?.imageUrl || "/defaultavatar.png"}
                className="flex h-40 w-40"
              ></Avatar>
              <div className="flex-col">
                <div className="flex justify-between">
                  <div className="username text-decoration-line: underline ml-16 mb-3">
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
                <div className="flex-col">
                  <div className="flex">
                    <div className="ml-16 mb-2">{`${posts.length} posts`}</div>
                    <div className="ml-8 mb-2">
                      {curUser && `${curUser.Followers} followers`}
                    </div>
                    <div className="ml-8 mb-2">
                      {curUser && `${curUser.Followings} following`}
                    </div>
                  </div>

                  <h5 className="ml-16 mb-3 text-gray-700">
                    {(curUser &&
                      curUser?.FirstName + " " + curUser?.LastName) ||
                      ""}
                    <span className="ml-3 text-wrap text-sm font-light text-slate-700 ">
                      {curUser && `${curUser?.profileType}`}
                    </span>
                  </h5>
                  <blockquote className="ml-16 border-l-2 pl-2 italic">
                    {curUser && curUser.username !== "sammyshaurya" ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: curUser.Bio,
                        }}
                      />
                    ) : (
                      <div>
                        &quot;After all,&quot; he said, &quot;everyone enjoys a
                        good joke, so it&apos;s only fair that they should pay
                        for the privilege.&quot;
                      </div>
                    )}
                  </blockquote>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
          </div>
          <div className="grid grid-cols-2 gap-4 mx-36 mb-10">
            {posts.map((post, index) => (
              <Posts
                key={index}
                post={post}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

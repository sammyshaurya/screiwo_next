'use client'
import React from "react";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import Posts from "@/app/components/Pages/main/Posts";
import { Avatar } from "@nextui-org/avatar";
import axios from "axios";
import { Button } from "@nextui-org/button";
import { useEffect, useState } from "react";
import { Divider } from "@nextui-org/divider";


const UsersProfile = ({params}) => {
  const [curUser, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followed, setFollowed] = useState(false);

  const searchUser = params.username;

  const submitFollow = async (toFollow) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Navigate("/");
        return;
      }
      const response = await axios.get(
        `/api/profile/follow`,
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
        const response = await axios.get(`/api/profile/usersprofile?username=${encodeURIComponent(searchUser)}`);
        const userProfile = response.data.userProfile
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
  }, [searchUser]);

  return (
    <div>
      <ProfileNav />
      <div className="flex">
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="mx-36 mt-6 flex flex-col items-start">
            <div className="flex items-center">
            <Avatar
                src="/defaultavatar.png"
                className="flex h-40 w-40"
              ></Avatar>
              <div className="flex-col">
                <div className="flex justify-between">
                  <div className="username text-decoration-line: underline ml-16 mb-3">
                    {curUser && curUser.username}
                  </div>
                  {/* <div className="ml-auto">
                    <Button
                      type="submit"
                      onClick={() => submitFollow(curUser.userid)}
                    >
                      {followed ? "Following" : "Follow"}
                    </Button>
                  </div> */}
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
            <Divider className="my-4" />
          </div>
          <div className="grid grid-cols-2 gap-4 mx-36 mb-10">
            {posts && posts.map((post, index) => (
              <Posts
                key={index}
                post={post}
                profile={curUser}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersProfile;
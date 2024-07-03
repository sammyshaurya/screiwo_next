"use client";
import React, { useEffect } from "react";
import LeftSidebar from "./Leftspan";
import RightSidebar from "./Rightspan";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import axios from "axios";
import Postcard from './Postcard'

const Home = () => {
  const [posts, setPosts] = React.useState();
  const [isloading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = localStorage.getItem("userObj");
        if (!user) {
          Navigate("/");
          return;
        }
        const response = await axios.get("/api/users/feed", {
          headers: {
            user: user,
            Authorization: localStorage.getItem("token"),
          },
        });
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
      {posts && <Postcard posts={posts} />}  
    </div>
    <div className="hidden md:block md:col-span-3">
      <RightSidebar />
    </div>
  </div>
</div>
  );
};

export default Home;

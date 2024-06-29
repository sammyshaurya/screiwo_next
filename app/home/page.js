'use client'
import React from 'react';
import LeftSidebar from './Leftspan';
import RightSidebar from './Rightspan';
import ProfileNav from '@/app/components/Pages/main/ProfileNav';

const Home = () => {
  const dummyPosts = [
    { title: "Post 1", content: "This is the content of post 1." },
    { title: "Post 2", content: "This is the content of post 2." },
    { title: "Post 3", content: "This is the content of post 3." },
    { title: "Post 4", content: "This is the content of post 4." },
    { title: "Post 5", content: "This is the content of post 5." },
  ];

  return (
    <div>
    <ProfileNav />
    <div className="container mx-auto h-screen grid grid-cols-12">
      <LeftSidebar />
      <div className="col-span-8 overflow-y-auto p-4 mx-32">
        {dummyPosts.map((post, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p className="text-gray-700">{post.content}</p>
          </div>
        ))}
      </div>
      <RightSidebar />
    </div>
    </div>
  );
};

export default Home;

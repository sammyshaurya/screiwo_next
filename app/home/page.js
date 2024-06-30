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
    <div className="min-h-screen bg-gray-100">
      <ProfileNav />
      <div className="block md:hidden">
      </div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4">
        <div className="hidden md:block md:col-span-3">
          <LeftSidebar />
        </div>
        <div className="col-span-1 md:col-span-6">
          {dummyPosts.map((post, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h2 className="text-lg md:text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-gray-700">{post.content}</p>
            </div>
          ))}
        </div>
        <div className="hidden md:block md:col-span-3">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default Home;

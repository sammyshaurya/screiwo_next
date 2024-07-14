'use client';
// components/BlogPost.jsx
import React from 'react';
import ProfileNav from '../components/Pages/main/ProfileNav';

const BlogPost = () => {
  const title = "Blog Post"
  const content = "<p>There was a <strong>Tiger</strong></p><p>He was in the zoo</p><ul class=\"list-disc\"><li><p>going to eat</p></li><li><p>food</p></li><li><p>and skin</p></li><li><p>meat</p></li></ul><img src=\"https://img-cdn.pixlr.com/image-generator/history/65ba5701b4f4f4419f746bc3/806ecb58-167c-4d20-b658-a6a6b2f221e9/medium.webp\">"
  return (
    <div className="min-h-screen bg-gray-100">
      <ProfileNav />
      <div className="container mx-auto py-8 px-4">
        <article className="prose lg:prose-xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl noto font-bold mb-4">{title}</h1>
          <div className="opensans" dangerouslySetInnerHTML={{ __html: content }} />
        </article>
      </div>
    </div>
  );
};

export default BlogPost;

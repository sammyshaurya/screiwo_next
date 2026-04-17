'use client'
import React, { useState } from "react";
import { Button } from "@nextui-org/button";
import axios from "axios";
import { SimpleEditor } from "../editor/editor";
import { Input } from "@/components/ui/input";
import ProfileNav from "../components/Pages/main/ProfileNav";

const Postings = () => {
  const [post, setPost] = useState({ title: "", content: "" });

  const postHandler = (event) => {
    setPost({ ...post, [event.target.name]: event.target.value });
  };

  const handleContentChange = (content) => {
    setPost({ ...post, content });
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const { title, content } = post;

    if (!title || !content) {
      alert("Please fill out all fields");
      return;
    }

    try {
      const response = await axios.post(
        "/api/users/createpost",
        { title, content },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.status === 201) {
        alert("Post created successfully!");
      } else {
        alert("Error creating post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post. Please try again later.");
    }
  };

  return (
    <>
    <ProfileNav />
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h1 className="text-4xl font-bold mb-8 text-center noto">
        Share Your Story
      </h1>
      <form className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block noto text-xl font-semibold mb-2"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            onChange={postHandler}
            placeholder="Title"
            className="w-full noto font-normal text-2xl px-4 py-3 border-l-4 border-transparent focus:border-blue-500 outline-none transition-colors duration-300 placeholder-gray-400"
          />
        </div>
        <div>
          <label
            htmlFor="Hero Image"
            className="block noto text-xl font-semibold mb-2"
          >
            Add Blog Hero Image
          </label>
          <Input type="file" />
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-xl noto font-semibold mb-2"
          >
            Content
          </label>
          <SimpleEditor
            id="content"
            name="content"
            onChange={handleContentChange}
          />
        </div>
        <div className="flex justify-center">
          <Button
            type="submit"
            onClick={handleSubmitPost}
            color="primary"
            variant="ghost"
            className="px-8 py-3 rounded-sm font-semibold"
          >
            Publish
          </Button>
        </div>
      </form>
    </div>
    </>
  );
};

export default Postings;

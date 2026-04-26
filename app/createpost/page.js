"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ProfileNav from "../components/Pages/main/ProfileNav";
import { SimpleEditor } from "../editor/editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Postings = () => {
  const router = useRouter();
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
        router.push("/profile");
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
      <div className="app-page">
        <main className="app-shell max-w-4xl">
          <section className="app-panel overflow-hidden rounded-[28px]">
            <div className="border-b border-slate-800/80 bg-slate-950/70 px-6 py-7 md:px-8">
              <p className="app-kicker">Create</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                Share your story
              </h1>
              <p className="app-subtitle">
                Write, preview, and publish from a calm, focused editor surface.
              </p>
            </div>
            <form className="space-y-6 p-6 md:p-8">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  onChange={postHandler}
                  placeholder="Title"
                  className="w-full rounded-2xl border border-slate-800/80 bg-slate-950 px-4 py-3 text-2xl font-normal text-white outline-none transition placeholder:text-slate-500 focus:border-white/20"
                />
              </div>
              <div>
                <label
                  htmlFor="Hero Image"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Add Blog Hero Image
                </label>
                <Input type="file" />
              </div>
              <div>
                <label
                  htmlFor="content"
                  className="mb-2 block text-sm font-medium text-slate-200"
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
                  className="app-action-primary"
                >
                  Publish
                </Button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </>
  );
};

export default Postings;

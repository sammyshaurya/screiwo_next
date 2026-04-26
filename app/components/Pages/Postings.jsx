import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Postings = () => {
  const router = useRouter();
  const textareaRef = useRef(null);
  const [post, setPost] = useState({ title: "", content: "" });

  const postHandler = (event) => {
    setPost({ ...post, [event.target.name]: event.target.value });
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
        "https://screiwo-backend.onrender.com/api/users/createpost",
        { title, content },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
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

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  return (
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
          <Input
            type="text"
            id="title"
            name="title"
            onChange={postHandler}
            placeholder="Title"
            className="w-full text-2xl font-normal"
          />
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-xl noto font-semibold mb-2"
          >
            Content
          </label>
          <Textarea
            id="content"
            name="content"
            onChange={postHandler}
            placeholder="Content"
            ref={textareaRef}
            onInput={handleTextareaInput}
            className="w-full text-lg font-normal"
          />
        </div>
        <div className="flex justify-center">
          <Button
            type="submit"
            onClick={handleSubmitPost}
            className=" px-8 py-3 rounded-md font-semibold"
          >
            Publish
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Postings;

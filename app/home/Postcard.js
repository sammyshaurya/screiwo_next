import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Divider } from "@nextui-org/divider";
import { Button } from "@/components/ui/button";
import React from "react";
import Link from "next/link";

function HeartIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function MessageCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

export default function Component({ posts }) {
  return (
    <div className="w-full rounded-lg ">
      {posts && posts.length > 0 ? (
        posts.map((post, index) => (
          <Card key={index} className="w-full p-4 mb-4 rounded-lg shadow-md">
            <Link href={`/post/${post.feed._id}`}>
            <h2 className="text-xl noto font-bold line-clamp-2 mb-5">
              {post.feed.title}
            </h2>
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href={`/user/${post.username}`}>
                <Avatar>
                  <AvatarImage src="/defaultavatar.png" />
                  <AvatarFallback>{post.username.charAt(0)}</AvatarFallback>
                </Avatar>
                </Link>
                <div className="text-sm text-muted-foreground">
                  <Link href={`/user/${post.username}`}>
                    <p className="font-medium">{post.username}</p>
                  </Link>
                  <p>{new Date(post.feed.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <Divider className="mt-2 border-gray-200" />
            <Link href={`/post/${post.feed._id}`}>
            <article className="prose prose-gray dark:prose-invert opensans line-clamp-4">
              <div dangerouslySetInnerHTML={{ __html: post.feed.content }} />
            </article>
            </Link>
            <Divider className="my-2 border-gray-200" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <HeartIcon className="w-4 h-4" />
                  <span className="sr-only">Like</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <MessageCircleIcon className="w-4 h-4" />
                  <span className="sr-only">Comment</span>
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{post.feed.likes} likes</p>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <h2 className="text-gray-600">
          Start following users to view their content here
        </h2>
      )}
    </div>
  );
}

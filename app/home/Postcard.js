import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import React from "react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { formatRelativeTime } from "@/app/lib/time";

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
  // Function to estimate reading time
  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  return (
    <div className="w-full space-y-6">
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <Card key={post._id} className="w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            {/* Header with author info */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Link href={`/user/${post.username}`}>
                    <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                      <AvatarImage src={post.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {post.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link href={`/user/${post.username}`}>
                      <p className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {post.username}
                      </p>
                    </Link>
                    <p className="text-sm text-gray-500">
                      {formatRelativeTime(post.DateofCreation || post.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {getReadingTime(post.excerpt || "")} min read
                </div>
              </div>

              {/* Title */}
              <Link href={`/post/${post._id}`}>
                <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight mb-3">
                  {post.title}
                </h2>
              </Link>

              {/* Content Preview */}
              <Link href={`/post/${post._id}`}>
                <div className="text-gray-700 leading-relaxed mb-4">
                  {post.coverImageUrl && (
                    <div className="mb-3 overflow-hidden rounded-lg border border-gray-100">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title || "Post preview image"}
                        className="h-44 w-full object-cover"
                      />
                    </div>
                  )}
                  <p className="line-clamp-3">{DOMPurify.sanitize(post.excerpt || "")}</p>
                </div>
              </Link>

              {/* Read More */}
              <Link href={`/post/${post._id}`}>
                <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Read more →
                </span>
              </Link>
            </div>

            {/* Footer with interactions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <HeartIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">{post.likes || 0}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <MessageCircleIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">{post.commentscount || 0}</span>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                  </svg>
                </Button>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No posts yet
          </h2>
          <p className="text-gray-500">
            Start following users to see their content here
          </p>
        </div>
      )}
    </div>
  );
}

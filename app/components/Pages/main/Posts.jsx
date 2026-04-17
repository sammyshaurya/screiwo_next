import React, { useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function Posts({ post, profile }) {
  const givenDate = new Date(post.createdAt || post.createdat || post.DateofCreation || Date.now());
  const { user: clerkUser } = useUser();
  const profileImage = post.profileImageUrl || profile.profileImageUrl || clerkUser?.imageUrl || null;
  const previewText = post.excerpt || post.contentText || "";
  const coverImageUrl = post.coverImageUrl || null;

  function formatTimeDifference(givenDate) {
    const currentDate = new Date();
    let timeDifference = currentDate.getTime() - givenDate.getTime();
    let secondsDifference = Math.floor(timeDifference / 1000);

    if (secondsDifference < 60) {
      return `${secondsDifference} second${
        secondsDifference !== 1 ? "s" : ""
      } ago`;
    }

    let minutesDifference = Math.floor(secondsDifference / 60);
    if (minutesDifference < 60) {
      return `${minutesDifference} minute${
        minutesDifference !== 1 ? "s" : ""
      } ago`;
    }

    let hoursDifference = Math.floor(minutesDifference / 60);
    if (hoursDifference < 24) {
      return `${hoursDifference} hour${hoursDifference !== 1 ? "s" : ""} ago`;
    }

    let daysDifference = Math.floor(hoursDifference / 24);
    if (daysDifference < 30) {
      return `${daysDifference} day${daysDifference !== 1 ? "s" : ""} ago`;
    }

    let monthsDifference = Math.floor(daysDifference / 30);
    if (monthsDifference < 12) {
      return `${monthsDifference} month${
        monthsDifference !== 1 ? "s" : ""
      } ago`;
    }

    let yearsDifference = Math.floor(monthsDifference / 12);
    return `${yearsDifference} year${yearsDifference !== 1 ? "s" : ""} ago`;
  }

  // Function to estimate reading time
  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  return (
    <Link href={`/post/${post._id}`}>
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 ring-2 ring-gray-100">
                <AvatarImage src={profileImage || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{profile.username}</p>
                <p className="text-xs text-gray-500">
                  {formatTimeDifference(givenDate)}
                </p>
              </div>
          </div>
          <div className="text-xs text-gray-400">
              {getReadingTime(previewText || post?.content || "")} min
          </div>
        </div>

          <CardTitle className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors leading-tight line-clamp-2">
            {post?.title ? post.title : "Untitled Post"}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          {coverImageUrl && (
            <div className="mb-3 overflow-hidden rounded-lg border border-gray-100">
              <img
                src={coverImageUrl}
                alt={post?.title || "Post preview image"}
                className="h-40 w-full object-cover"
              />
            </div>
          )}
          <div className="text-gray-700 leading-relaxed">
            {previewText ? (
              <div className="space-y-2">
                {post.hasHeadings && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Structured post
                  </p>
                )}
                <p className="line-clamp-4 whitespace-pre-line text-sm">
                  {DOMPurify.sanitize(previewText)}
                </p>
              </div>
            ) : post?.content ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post?.content) }}
              />
            ) : (
              <p className="text-gray-500 italic">
                This post contains media or rich formatting without text preview yet.
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm">{post.likes || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                  <span className="text-sm">{post.commentscount || 0}</span>
              </div>
            </div>
            <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Read →
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

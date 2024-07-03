import React, { useEffect } from "react";
import { Avatar } from "@nextui-org/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export default function Posts({ post, profile }) {
  const givenDate = new Date(post.createdat);

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


  return (
    <Card className="flex flex-col p-1">
      <CardHeader>
        <CardTitle className="text-2xl mb-2 line-clamp-2">
          {post?.title ? post.title : "No Title"}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center">
            <Avatar src="/defaultavatar.png" className="h-8 w-8"></Avatar>
            <span className="ml-3">{profile.username}</span>
            <span className="text-xs ml-auto">
              {formatTimeDifference(givenDate)}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <hr className="mx-4 border-t-1 border-gray-500 dark:border-gray-700" />
      <CardContent className="flex-1 mt-2">
        <div className="line-clamp-3">
          {post?.content
            ? post?.content
            : "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cumque eaque architecto quis tempore sit officia quisquam similique saepe, temporibus necessitatibus inventore maxime veritatis rem dolores laboriosam ducimus sed quam quasi?"}
        </div>
      </CardContent>

      <CardFooter className="mt-auto">
        <div className="flex items-center">
          <h6 className="text-sm mr-4 mt-2">{post.likes || "0 likes and comments"}</h6>
          </div>
      </CardFooter>
    </Card>
  );
}

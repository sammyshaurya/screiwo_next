"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import ProfileNav from "@/app/components/Pages/main/ProfileNav";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
} from "@nextui-org/react";

const AuthorCard = ({ author }) => {
  const [isFollowed, setIsFollowed] = useState(false);
  return (
    <Card className="w-full">
      <CardHeader className="justify-between">
        <Link href={`/user/${author.username}`}>
          <div className="flex gap-5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={author.avatar || "/defaultavatar.png"} />
              <AvatarFallback>{author.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 items-start justify-center">
              <h4 className="text-small font-semibold leading-none text-default-600">
                {author.username}
              </h4>
              <h5 className="text-small tracking-tight text-default-400">
                @{author.username}
              </h5>
            </div>
          </div>
        </Link>
        {!author.follows == "myself" && (
          <Button
            className={
              isFollowed
                ? "bg-transparent text-foreground border-default-200"
                : ""
            }
            color="primary"
            radius="full"
            size="sm"
            variant={isFollowed ? "bordered" : "solid"}
            onPress={() => setIsFollowed(!isFollowed)}
          >
            {isFollowed ? "Unfollow" : "Follow"}
          </Button>
        )}
      </CardHeader>
      <CardBody className="px-3 py-0 text-small text-default-400">
        <p>
          {author.bio ||
            "Frontend developer and UI/UX enthusiast. Join me on this coding adventure!"}
        </p>
        <span className="pt-2">
          #FrontendWithZoey
          <span className="py-2" aria-label="computer" role="img">
            💻
          </span>
        </span>
      </CardBody>
      <CardFooter className="gap-3">
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">
            {author.Followers}
          </p>
          <p className="text-default-400 text-small">Following</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-default-400 text-small">
            {author.Followings}
          </p>
          <p className="text-default-400 text-small">Followers</p>
        </div>
      </CardFooter>
    </Card>
  );
};

const PostPage = () => {
  const { postid } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (postid) {
      axios
        .get(`/api/getpost?postid=${postid}`, {
          headers: {
            authorization: localStorage.getItem("token"),
            userid: localStorage.getItem("userObj"),
          },
        })
        .then((response) => {
          setPost(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setError("Failed to load post.");
          setLoading(false);
        });
    }
  }, [postid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Post not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProfileNav />
      <header className="bg-muted py-12 md:py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold md:text-5xl noto">
              {post.title}
            </h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={post.author.avatar || "/defaultavatar.png"}
                  />
                  <AvatarFallback>
                    {post.author.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Link href={`/user/${post.author.username}`}>
                  <span className="text-sm font-medium">
                    {post.author.username}
                  </span>
                </Link>
              </div>
              <span className="text-sm">
                {new Date(post.DateofCreation).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </header>
      <main className="container max-w-6xl mx-auto py-12 md:py-20 px-4 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        <article className="prose max-w-none text-lg prose-gray opensans dark:prose-invert md:border-r-2 border-gray-200 md:pr-8 pr-4 w-full">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
        <div className="w-full">
          <AuthorCard author={post.author} />
        </div>
      </main>
    </div>
  );
};

export default PostPage;

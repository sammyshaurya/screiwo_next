import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function SignInRedirectPage() {
  const { userId } = auth();

  if (userId) {
    redirect("/home");
  }

  redirect("/");
}

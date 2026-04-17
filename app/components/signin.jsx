"use client";
import { SignedOut, SignIn } from "@clerk/nextjs";

export default function Signin() {  
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
    <SignedOut>
      <SignIn routing="hash" />
    </SignedOut>
    </div>
  );
}

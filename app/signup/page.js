import { SignedOut,  SignUp } from "@clerk/nextjs";

export default function Signin() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
    <SignedOut>
      <SignUp routing="hash" />
    </SignedOut>
    </div>
  );
}

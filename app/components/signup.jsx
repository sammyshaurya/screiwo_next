import { SignUp } from "@clerk/nextjs";
import { ClerkProvider } from "@clerk/nextjs";

export default function Signin() {
  return (
    <ClerkProvider>
      <SignUp />
    </ClerkProvider>
  );
}

import { SignedOut, SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/app/lib/clerkConfig";

export default function Signin() {
  return (
    <div className="app-page">
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
          <div className="max-w-2xl">
            <p className="app-kicker">Create account</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Join Screiwo and start writing.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Create a profile, publish writing, and follow creators in a focused publishing network built for readers and writers.
            </p>
          </div>

          <div className="mx-auto w-full max-w-md">
            <SignedOut>
              <div className="app-panel overflow-hidden rounded-[28px] border border-white/10">
                <div className="bg-black/70 px-5 py-6 sm:px-6">
                  <p className="app-kicker">Sign up</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                    Start your account
                  </h2>
                </div>
                <div className="bg-black/50 p-3 sm:p-4">
                  <div className="overflow-hidden rounded-[22px]">
                    <SignUp routing="hash" appearance={clerkAppearance} />
                  </div>
                </div>
              </div>
            </SignedOut>
          </div>
        </div>
      </main>
    </div>
  );
}

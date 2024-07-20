import { SignedOut, SignUp } from "@clerk/nextjs";

export default function Signin() {
  return (
    <div className=" flex flex-col">
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between bg-white bg-opacity-90 p-6 lg:p-12 rounded-lg max-w-4xl mx-auto">
          <div className="flex-1 lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0 hidden lg:block">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              Welcome to <span className="text-blue-600">Scriewo</span>
            </h1>
            <p className="text-base lg:text-lg text-gray-700">
              Join our vibrant community by creating an account. It’s quick and easy!
            </p>
          </div>

          <div className="flex-1 lg:w-1/2 flex items-center justify-center">
            <div className="">
              <SignedOut>
                <SignUp routing="hash" />
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

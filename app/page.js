import React from "react";
import Signin from "./components/signin";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative w-full bg-gradient h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-transparent opacity-50 -z-20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between bg-white bg-opacity-70 p-8 lg:p-16 rounded-lg shadow-lg max-w-6xl mx-auto">
          {/* Discover Section */}
          <div className="flex-1 lg:w-1/2 lg:pr-12 text-center lg:text-left">
            <h1 className="text-4xl noto lg:text-5xl font-bold text-gray-900 mb-6">
              Discover <span className="text-blue-600">Scriewo</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-700 mb-8">
              A vibrant platform for sharing ideas and connecting with others.
              Join us today and start exploring!
            </p>
          </div>

          {/* Signin Section */}
          <div className="flex-1 lg:w-1/2 flex items-center justify-center lg:justify-end">
            <Signin />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-6 lg:px-24 bg-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          What&apos;s Screiwo?
        </h2>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-lg transition-transform transform hover:scale-105">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full mb-4">
              <span className="text-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="28px"
                  viewBox="0 -960 960 960"
                  width="28px"
                  fill="#ffffff"
                >
                  <path d="M260-300h260v-60H260v60Zm380 0h60v-360h-60v360ZM260-450h260v-60H260v60Zm0-150h260v-60H260v60ZM132-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h696q24 0 42 18t18 42v600q0 24-18 42t-42 18H132Zm0-60h696v-600H132v600Zm0 0v-600 600Z" />
                </svg>
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Blogs and Articles Redefined
            </h3>
            <p className="text-gray-600 text-center">
              Seamlessly create and share your blog posts directly from your
              profile, reaching an engaged audience.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-lg transition-transform transform hover:scale-105">
            <div className="w-12 h-12 flex items-center justify-center bg-green-500 text-white rounded-full mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Engaged Community</h3>
            <p className="text-gray-600 text-center">
              Connect with a dynamic community that values and interacts with
              your blogs.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-lg transition-transform transform hover:scale-105">
            <div className="w-12 h-12 flex items-center justify-center bg-red-500 text-white rounded-full mb-4">
              <span className="text-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="32px"
                  viewBox="0 -960 960 960"
                  width="32px"
                  fill="#ffffff"
                >
                  <path d="M240-120 87-273l153-153 49 49-69 69h520l-69-69 49-49 153 153-153 153-49-49 69-69H220l69 69-49 49ZM99-535v-13q0-21.08 11.41-38.65T142-613q25.08-10.52 51.6-16.26 26.53-5.74 55.46-5.74 28.94 0 55.42 5.74T356-613q20.18 8.78 31.59 26.35T399-548v13H99Zm462 0v-13q0-21.08 11.41-38.65T604-613q25.08-10.52 51.6-16.26 26.53-5.74 55.46-5.74 28.94 0 55.42 5.74T818-613q20.18 8.78 31.59 26.35T861-548v13H561ZM248.96-690Q218-690 196-712.04q-22-22.05-22-53Q174-796 196.04-818q22.05-22 53-22Q280-840 302-817.96q22 22.05 22 53Q324-734 301.96-712q-22.05 22-53 22Zm462 0Q680-690 658-712.04q-22-22.05-22-53Q636-796 658.04-818q22.05-22 53-22Q742-840 764-817.96q22 22.05 22 53Q786-734 763.96-712q-22.05 22-53 22Z" />
                </svg>
              </span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Your audience</h3>
            <p className="text-gray-600 text-center">
              Leverage your blog to attract followers and create meaningful
              connections while expanding your influence.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p className="text-sm">
          &copy; 2024 Scriewo. Created by{" "}
          <a
            href="https://twitter.com/sammy_shaurya"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @sammyshaurya
          </a>
        </p>
      </footer>
    </div>
  );
}

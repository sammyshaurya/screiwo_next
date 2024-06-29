'use client'
import React, {useState} from "react";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Signin from "./components/signin";
import Signup from "./components/signup";

export default function Home() {
  const [usermode, setusermode] = useState(true);

  function togglemode() {
    setusermode(!usermode);
  }
  return (
    <>
    <Navbar />
    <div className="flex flex-col lg:flex-row">
      <div className="flex flex-col items-center justify-start lg:w-1/2 h-full lg:pl-10">
        <Image
          src="/main.svg"
          alt="Description"
          className="ml-10 lg:w-full lg:h-auto lg:ml-0 lg:mt-10 hidden lg:block"
          width={800}
          height={800}
        />
      </div>
      <div className="flex flex-col w-full lg:w-1/2">
        {usermode ? <Signin togglemode={togglemode} /> : <Signup togglemode={togglemode} />}
      </div>
    </div>
  </>
  );
}

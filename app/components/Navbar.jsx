import Image from "next/image";
import React from "react";

const Navbar = () => {
  return (
    <nav className="flex items-center border-b border-gray-100">
      <Image src="/svg/logo.svg" alt="Description" width={80} height={80} />
      <h2 className="mt-2">Scriewo</h2>
    </nav>
  );
};

export default Navbar;

import React, { useState } from "react";
import logo from "@/public/Logo.png";
import Link from "next/link";
import SearchIcon from "/public/assets/Search";
import Image from "next/image";
import { Input } from "@nextui-org/input";
import { useRouter } from 'next/navigation';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/navbar";

export const ProfileNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchList, setSearchList] = useState([]);
  const Router = useRouter();

  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleSearchBlur = () => {
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim().length > 2) {
      fetch(
        `/api/allusers?q=${e.target.value}`
      )
        .then((response) => response.json())
        .then((data) => {
          setSearchList(
            data.map((user) => ({
              username: user.username,
              userid: user.userid,
            }))
          );
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setSearchList([]);
    }
  };

  const menuItems = ["Home", "Profile", "Settings", "Log Out"];

  return (
    <div className="relative">
      <Navbar onMenuOpenChange={setIsMenuOpen} isBordered isBlurred={false}>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link href="/">
            <Image src={logo} alt="Logo" width={150} height={150} />
          </Link>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4 mt-2" justify="center">
          <NavbarItem>
            <Link color="foreground" href="/home">
              Home
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="/profile" aria-current="page">
              Profile
            </Link>
          </NavbarItem>
          <NavbarContent justify="end">
            <Input
              className="mt-2 relative z-10"
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={handleInputChange}
              onBlur={handleSearchBlur}
              onFocus={handleSearchFocus}
              startContent={<SearchIcon size={18} />}
            />
            {searchList.length > 0 && (
              <div className="absolute top-full p-2 bg-white border rounded-md shadow-lg w-1/3">
                {searchList.map((user, index) => (
                  <div
                    onClick={()=> {return Router.push(`/user/${user.username}`)}}
                    key={index}
                    className="block py-1 px-2 w-full hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span>{user.username}</span>
                      <hr className="my-2 border-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </NavbarContent>
        </NavbarContent>

        <NavbarMenu>
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={index === menuItems.length - 1 ? "danger" : "foreground"}
                className="w-full"
                href="#"
                size="lg"
              >
                {item}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
    </div>
  );
};

export default ProfileNav;

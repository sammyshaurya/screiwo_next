import React, { useState } from "react";
import logo from "@/public/Logo.png";
import Link from "next/link";
import SearchIcon from "/public/assets/Search";
import Image from "next/image";
import { Input } from "@nextui-org/input";
import { useRouter } from "next/navigation";
import { SignedIn, UserButton } from "@clerk/nextjs";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { useClickOutside } from "react-click-outside-hook";
import { Button } from "@/components/ui/button";

const SearchInput = ({
  searchTerm,
  setSearchTerm,
  searchList,
  setSearchList,
  isDropdownOpen,
  setIsDropdownOpen,
}) => {
  const Router = useRouter();
  const [dropdownRef, hasClickedOutside] = useClickOutside();

  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (hasClickedOutside) {
        setIsDropdownOpen(false);
      }
    }, 400);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim().length > 2) {
      fetch(`/api/allusers?q=${e.target.value}`)
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

  return (
    <div className="relative">
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
      {isDropdownOpen && searchList.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full p-2 bg-white border rounded-md shadow-lg w-full"
        >
          {searchList.map((user, index) => (
            <div
              onClick={() => {
                Router.push(`/user/${user.username}`);
              }}
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
    </div>
  );
};

export const ProfileNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchList, setSearchList] = useState([]);

  const menuItems = ["Home", "Profile", "Settings"];
  const LinkMap = {
    Home: "/home",
    Profile: "/profile",
    Settings: "/settings",
  };

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} isBordered isBlurred={false} className="shadow-sm">
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />
      <NavbarBrand>
        <Link href="/home">
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
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchList={searchList}
            setSearchList={setSearchList}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
          />
          <SignedIn>
            <UserButton />
          </SignedIn>
        </NavbarContent>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link className="w-full" href={LinkMap[item]} size="lg">
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Button variant="link" className="p-0 mt-2 text-md underline">
            Log Out
          </Button>
        </NavbarMenuItem>
        <NavbarMenuItem className="mt-4">
          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchList={searchList}
            setSearchList={setSearchList}
            isDropdownOpen={isDropdownOpen}
            setIsDropdownOpen={setIsDropdownOpen}
          />
          <SignedIn>
            <UserButton />
          </SignedIn>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
};

export default ProfileNav;

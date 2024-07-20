import React from "react";
import { Bookmark, Settings, CircleUser, House } from "lucide-react";

const LeftSidebar = () => {
  return (
    <div>
      <ul className="space-y-4">
        <li>
          <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-blue-50 p-2 rounded-md transition duration-150">
            <House className="text-blue-500" />
            <span className="font-medium">Home</span>
          </a>
        </li>
        <li>
          <a href="/profile" className="flex items-center space-x-3 text-gray-700 hover:bg-blue-50 p-2 rounded-md transition duration-150">
            <CircleUser className="text-blue-500" />
            <span className="font-medium">Profile</span>
          </a>
        </li>
        <li>
          <a href="/settings" className="flex items-center space-x-3 text-gray-700 hover:bg-blue-50 p-2 rounded-md transition duration-150">
            <Settings className="text-blue-500" />
            <span className="font-medium">Settings</span>
          </a>
        </li>
        <li>
          <a href="/saves" className="flex items-center space-x-3 text-gray-700 hover:bg-blue-50 p-2 rounded-md transition duration-150">
            <Bookmark className="text-blue-500" />
            <span className="font-medium">Saves</span>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default LeftSidebar;

import React from "react";
import { Bookmark, Settings, CircleUser, House, Flame, TrendingUp, Bell, Share2 } from "lucide-react";

const LeftSidebar = () => {
  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-sm">MENU</h3>
        </div>
        <ul className="divide-y divide-gray-100">
          <li>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-blue-50 p-3 transition duration-150">
              <House className="text-blue-500 w-5 h-5" />
              <span className="font-medium text-sm">Home</span>
            </a>
          </li>
          <li>
            <a href="/profile" className="flex items-center space-x-3 text-gray-700 hover:bg-blue-50 p-3 transition duration-150">
              <CircleUser className="text-blue-500 w-5 h-5" />
              <span className="font-medium text-sm">Profile</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-blue-50 p-3 transition duration-150">
              <Bell className="text-orange-500 w-5 h-5" />
              <span className="font-medium text-sm">Notifications</span>
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">3</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 text-gray-700 hover:bg-blue-50 p-3 transition duration-150">
              <Bookmark className="text-purple-500 w-5 h-5" />
              <span className="font-medium text-sm">Bookmarks</span>
            </a>
          </li>
          <li>
            <a href="/settings" className="flex items-center space-x-3 text-gray-700 hover:bg-blue-50 p-3 transition duration-150">
              <Settings className="text-gray-500 w-5 h-5" />
              <span className="font-medium text-sm">Settings</span>
            </a>
          </li>
        </ul>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-sm">YOUR STATS</h3>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-100 p-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">245</p>
            <p className="text-xs text-gray-600">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">1,234</p>
            <p className="text-xs text-gray-600">Followers</p>
          </div>
        </div>
      </div>

      {/* Recommended Topics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-gray-200 flex items-center gap-2">
          <Flame className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-gray-900 text-sm">POPULAR TOPICS</h3>
        </div>
        <div className="divide-y divide-gray-100 p-3 space-y-2">
          {[
            { name: 'React', category: 'Framework' },
            { name: 'Next.js', category: 'Framework' },
            { name: 'TypeScript', category: 'Language' },
            { name: 'Web Design', category: 'Design' },
          ].map((topic, idx) => (
            <button key={idx} className="w-full text-left p-2 hover:bg-gray-50 rounded transition">
              <p className="text-sm font-medium text-gray-900">{topic.name}</p>
              <p className="text-xs text-gray-500">{topic.category}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;

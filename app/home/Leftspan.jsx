import React from 'react';

const LeftSidebar = () => {
  return (
    <div className="col-span-2 border-r h-full p-4">
      <ul>
        <li className="mb-4"><a href="#">Home</a></li>
        <li className="mb-4"><a href="/profile">Profile</a></li>
        <li className="mb-4"><a href="/settings">Settings</a></li>
        <li className="mb-4"><a href="#">Logout</a></li>
      </ul>
    </div>
  );
};

export default LeftSidebar;

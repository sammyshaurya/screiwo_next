import React from 'react';

const RightSidebar = () => {
  return (
    <div className="col-span-2 border-l h-full p-4">
      <div className="mb-4">
        <h3 className="font-bold">Recent Activities</h3>
        <ul>
          <li className="mb-2">User A liked your post</li>
          <li className="mb-2">User B commented on your post</li>
          <li className="mb-2">User C followed you</li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold">Suggestions</h3>
        <ul>
          <li className="mb-2">User D</li>
          <li className="mb-2">User E</li>
          <li className="mb-2">User F</li>
        </ul>
      </div>
    </div>
  );
};

export default RightSidebar;

import { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import axios from "axios";

const FollowingsList = ({ handleFollowingClick }) => {
  const [showFollowings, setShowFollowings] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/follow/followings`, {
      method: "GET"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setShowFollowings(data);
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
      });
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black opacity-60"></div>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-80">
          <div className="p-4">
            <div className="flex flex-row justify-between">
              <h3 className="text-lg font-medium mb-2">Followers</h3>
              <Button onClick={handleFollowingClick} variant="ghost">
                Close
              </Button>
            </div>
            <div className="w-full h-80 overflow-y-auto">
              <ul>
                {showFollowings &&
                  showFollowings.map((follower, index) => (
                    <Link
                      className="mb-2 text-clip"
                      key={index}
                      href={`/user/${follower.username}`}
                    >
                      <li key={index} className="mb-1">
                        {follower.username}
                      </li>
                    </Link>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FollowingsList;

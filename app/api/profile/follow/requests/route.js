import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectdb } from "@/app/lib/db";
import Profile from "@/app/models/Profile.model";
import { FeedFromFollow } from "@/app/api/users/createpost/FeedUpdate";
import { syncProfileCounters } from "@/app/lib/profileData";

async function getRequestProfiles(requestIds = []) {
  if (!requestIds.length) {
    return [];
  }

  return Profile.find(
    { userid: { $in: requestIds } },
    { username: 1, userid: 1, FirstName: 1, LastName: 1, profileImageUrl: 1, Bio: 1 }
  ).lean();
}

async function getProfileSnapshot(userid) {
  return Profile.findOne(
    { userid },
    {
      username: 1,
      profileImageUrl: 1,
      FirstName: 1,
      LastName: 1,
      Followers: 1,
      Followings: 1,
      FollowersList: 1,
      FollowingsList: 1,
      FollowRequestsReceived: 1,
      FollowRequestsSent: 1,
      Bio: 1,
      website: 1,
      location: 1,
      dob: 1,
      profileType: 1,
      gender: 1,
      mobile: 1,
      preferences: 1,
      postCount: 1,
    }
  ).lean();
}

async function syncFollowCounts(userId) {
  const profile = await Profile.findOne(
    { userid: userId },
    { FollowersList: 1, FollowingsList: 1 }
  ).lean();

  if (!profile) {
    return;
  }

  await Profile.updateOne(
    { userid: userId },
    {
      $set: {
        Followers: (profile.FollowersList || []).length,
        Followings: (profile.FollowingsList || []).length,
      },
    }
  );
}

export const GET = async () => {
  await connectdb();
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  const profile = await Profile.findOne({ userid: userId }, { FollowRequestsReceived: 1 }).lean();
  if (!profile) {
    return NextResponse.json([], { status: 200 });
  }

  const requests = await getRequestProfiles(profile.FollowRequestsReceived || []);

  return NextResponse.json(
    { requests },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
};

export const POST = async (req) => {
  await connectdb();
  const signeduser = await currentUser();
  if (!signeduser) {
    return NextResponse.json("Unauthorized access", { status: 401 });
  }

  const body = await req.json();
  const requestUser = body.requestUser?.toString?.();
  const action = body.action || "accept";

  if (!requestUser) {
    return NextResponse.json({ message: "Request user is missing" }, { status: 400 });
  }

  const targetProfile = await Profile.findOne({ userid: signeduser.id }).lean();
  const requestProfile = await Profile.findOne({ userid: requestUser }).lean();

  if (!targetProfile || !requestProfile) {
    return NextResponse.json({ message: "No user found" }, { status: 404 });
  }

  const pending = (targetProfile.FollowRequestsReceived || []).some((id) => id?.toString?.() === requestUser);
  if (!pending) {
    return NextResponse.json({ message: "No pending request found" }, { status: 404 });
  }

  if (action === "decline") {
    await Profile.findOneAndUpdate(
      { userid: signeduser.id },
      {
        $pull: { FollowRequestsReceived: requestUser },
      }
    );

    await Profile.findOneAndUpdate(
      { userid: requestUser },
      {
        $pull: { FollowRequestsSent: signeduser.id },
      }
    );

    const actorProfile = await getProfileSnapshot(signeduser.id);
    const targetProfile = await getProfileSnapshot(requestUser);

    return NextResponse.json(
      { message: "Request declined", relationship: "none", actorProfile, targetProfile },
      { status: 200 }
    );
  }

  await Profile.findOneAndUpdate(
    { userid: signeduser.id },
    {
      $pull: { FollowRequestsReceived: requestUser },
      $addToSet: { FollowersList: requestUser },
    }
  );

  await Profile.findOneAndUpdate(
    { userid: requestUser },
    {
      $pull: { FollowRequestsSent: signeduser.id },
      $addToSet: { FollowingsList: signeduser.id },
    }
  );

  await syncFollowCounts(signeduser.id);
  await syncFollowCounts(requestUser);
  await syncProfileCounters(signeduser.id);
  await syncProfileCounters(requestUser);

  await FeedFromFollow(requestUser, signeduser.id, targetProfile.username);

  const actorProfile = await getProfileSnapshot(signeduser.id);
  const requestProfileSnapshot = await getProfileSnapshot(requestUser);

  return NextResponse.json(
    {
      message: "Request accepted",
      relationship: "following",
      actorProfile,
      targetProfile: requestProfileSnapshot,
    },
    { status: 200 }
  );
};

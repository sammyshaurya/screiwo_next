import Profile from "@/app/models/Profile.model";
import Posts from "@/app/models/Posts.model";
import Follow from "@/app/models/Follow.model";

function toId(value) {
  return value?.toString?.() || "";
}

async function getFollowCountsByUserIds(userIds = []) {
  const uniqueUserIds = [...new Set((userIds || []).map(toId).filter(Boolean))];

  if (uniqueUserIds.length === 0) {
    return new Map();
  }

  const [followersRows = [], followingRows = []] = await Promise.all([
    Follow.aggregate([
      { $match: { followingId: { $in: uniqueUserIds }, status: "following" } },
      { $group: { _id: "$followingId", count: { $sum: 1 } } },
    ]),
    Follow.aggregate([
      { $match: { followerId: { $in: uniqueUserIds }, status: "following" } },
      { $group: { _id: "$followerId", count: { $sum: 1 } } },
    ]),
  ]);

  const countsMap = new Map(
    uniqueUserIds.map((userId) => [userId, { Followers: 0, Followings: 0 }])
  );

  followersRows.forEach((row) => {
    const userId = toId(row._id);
    if (countsMap.has(userId)) {
      countsMap.get(userId).Followers = row.count || 0;
    }
  });

  followingRows.forEach((row) => {
    const userId = toId(row._id);
    if (countsMap.has(userId)) {
      countsMap.get(userId).Followings = row.count || 0;
    }
  });

  return countsMap;
}

export async function getLiveProfileCounts(profile = {}, postCount = null) {
  const userId = toId(profile?.userid);
  const followCounts = userId ? await getFollowCountsByUserIds([userId]) : null;
  const liveCounts = followCounts?.get(userId) || {};
  const followers = Number(liveCounts.Followers ?? profile?.Followers ?? 0);
  const followings = Number(liveCounts.Followings ?? profile?.Followings ?? 0);
  const resolvedPostCount =
    Number.isFinite(postCount) && postCount !== null
      ? postCount
      : Number(profile?.postCount ?? 0);

  return {
    Followers: followers,
    Followings: followings,
    postCount: resolvedPostCount,
    postsCount: resolvedPostCount,
  };
}

export async function withLiveProfileCounts(profile, postCount = null) {
  if (!profile) {
    return profile;
  }

  return {
    ...profile,
    ...(await getLiveProfileCounts(profile, postCount)),
  };
}

export async function syncProfileCounters(userId) {
  if (!userId) {
    return null;
  }

  if (
    typeof Profile.findOne !== "function" ||
    typeof Profile.updateOne !== "function" ||
    typeof Posts.countDocuments !== "function"
  ) {
    return null;
  }

  const [profile, postCount, countsMap] = await Promise.all([
    Profile.findOne(
      { userid: userId },
      { FollowersList: 1, FollowingsList: 1, FollowRequestsReceived: 1, FollowRequestsSent: 1 }
    ).lean(),
    Posts.countDocuments({ userid: userId, isDeleted: { $ne: true } }),
    getFollowCountsByUserIds([userId]),
  ]);

  if (!profile) {
    return null;
  }

  const counters = {
    ...(countsMap.get(userId) || { Followers: 0, Followings: 0 }),
    postCount: Number.isFinite(postCount) ? postCount : Number(profile?.postCount ?? 0),
    postsCount: Number.isFinite(postCount) ? postCount : Number(profile?.postCount ?? 0),
  };

  await Profile.updateOne(
    { userid: userId },
    {
      $set: {
        Followers: counters.Followers,
        Followings: counters.Followings,
        postCount: counters.postCount,
      },
    }
  );

  const nextFollowers = await Follow.find(
    { followingId: userId, status: "following" },
    { followerId: 1, _id: 0 }
  ).lean();
  const nextFollowings = await Follow.find(
    { followerId: userId, status: "following" },
    { followingId: 1, _id: 0 }
  ).lean();
  const nextRequestsReceived = await Follow.find(
    { followingId: userId, status: "requested" },
    { followerId: 1, _id: 0 }
  ).lean();
  const nextRequestsSent = await Follow.find(
    { followerId: userId, status: "requested" },
    { followingId: 1, _id: 0 }
  ).lean();

  await Profile.updateOne(
    { userid: userId },
    {
      $set: {
        FollowersList: nextFollowers.map((item) => item.followerId),
        FollowingsList: nextFollowings.map((item) => item.followingId),
        FollowRequestsReceived: nextRequestsReceived.map((item) => item.followerId),
        FollowRequestsSent: nextRequestsSent.map((item) => item.followingId),
      },
    }
  );

  return counters;
}

export async function toProfileSummary(profile) {
  if (!profile) {
    return null;
  }

  const counts = await getLiveProfileCounts(profile);
  return {
    userid: profile.userid,
    username: profile.username,
    FirstName: profile.FirstName,
    LastName: profile.LastName,
    profileImageUrl: profile.profileImageUrl || null,
    profileType: profile.profileType,
    Bio: profile.Bio,
    Followers: counts.Followers,
    Followings: counts.Followings,
    postCount: counts.postCount,
  };
}

export async function getProfileMapByUserIds(userIds) {
  const uniqueUserIds = [...new Set((userIds || []).filter(Boolean))];

  if (uniqueUserIds.length === 0) {
    return new Map();
  }

  const profiles = await Profile.find(
    { userid: { $in: uniqueUserIds } },
    {
      userid: 1,
      username: 1,
      FirstName: 1,
      LastName: 1,
      profileImageUrl: 1,
      profileType: 1,
      Bio: 1,
      Followers: 1,
      Followings: 1,
    }
  ).lean();

  const countsMap = await getFollowCountsByUserIds(uniqueUserIds);

  return new Map(
    profiles.map((profile) => {
      const counts = countsMap.get(profile.userid) || { Followers: 0, Followings: 0 };
      return [
        profile.userid,
        {
          userid: profile.userid,
          username: profile.username,
          FirstName: profile.FirstName,
          LastName: profile.LastName,
          profileImageUrl: profile.profileImageUrl || null,
          profileType: profile.profileType,
          Bio: profile.Bio,
          Followers: counts.Followers,
          Followings: counts.Followings,
          postCount: Number(profile.postCount ?? 0),
        },
      ];
    })
  );
}

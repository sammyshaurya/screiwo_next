import Profile from "@/app/models/Profile.model";
import Posts from "@/app/models/Posts.model";

export function getLiveProfileCounts(profile = {}, postCount = null) {
  const followers = Array.isArray(profile?.FollowersList)
    ? profile.FollowersList.length
    : Number(profile?.Followers ?? 0);
  const followings = Array.isArray(profile?.FollowingsList)
    ? profile.FollowingsList.length
    : Number(profile?.Followings ?? 0);
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

export function withLiveProfileCounts(profile, postCount = null) {
  if (!profile) {
    return profile;
  }

  return {
    ...profile,
    ...getLiveProfileCounts(profile, postCount),
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

  const [profile, postCount] = await Promise.all([
    Profile.findOne({ userid: userId }, { FollowersList: 1, FollowingsList: 1 }).lean(),
    Posts.countDocuments({ userid: userId, isDeleted: { $ne: true } }),
  ]);

  if (!profile) {
    return null;
  }

  const counters = getLiveProfileCounts(profile, postCount);

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

  return counters;
}

export function toProfileSummary(profile) {
  if (!profile) {
    return null;
  }

  const counts = getLiveProfileCounts(profile);
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

  return new Map(profiles.map((profile) => [profile.userid, toProfileSummary(profile)]));
}

import Profile from "@/app/models/Profile.model";

export function toProfileSummary(profile) {
  if (!profile) {
    return null;
  }

  return {
    userid: profile.userid,
    username: profile.username,
    FirstName: profile.FirstName,
    LastName: profile.LastName,
    profileImageUrl: profile.profileImageUrl || null,
    profileType: profile.profileType,
    Bio: profile.Bio,
    Followers: profile.Followers ?? 0,
    Followings: profile.Followings ?? 0,
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

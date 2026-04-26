import Follow from "@/app/models/Follow.model";

export function isPrivateProfile(profile) {
  return profile?.preferences?.profileVisibility === "private";
}

export function isProfileOwner(profile, viewerId) {
  return Boolean(profile?.userid && viewerId && profile.userid === viewerId);
}

export async function isProfileFollower(profile, viewerId) {
  if (!profile || !viewerId) {
    return false;
  }

  const relation = await Follow.findOne({
    followerId: viewerId,
    followingId: profile.userid,
    status: "following",
  })
    .lean()
    .catch(() => null);

  return Boolean(relation);
}

export async function canViewProfile(profile, viewerId) {
  if (!profile) {
    return false;
  }

  if (!isPrivateProfile(profile)) {
    return true;
  }

  return isProfileOwner(profile, viewerId) || (await isProfileFollower(profile, viewerId));
}

export async function canCommentOnPost(authorProfile, viewerId) {
  if (!authorProfile) {
    return false;
  }

  if (!(await canViewProfile(authorProfile, viewerId))) {
    return false;
  }

  return authorProfile?.preferences?.allowComments !== false;
}

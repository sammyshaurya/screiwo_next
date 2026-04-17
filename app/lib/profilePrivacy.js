export function isPrivateProfile(profile) {
  return profile?.preferences?.profileVisibility === "private";
}

export function isProfileOwner(profile, viewerId) {
  return Boolean(profile?.userid && viewerId && profile.userid === viewerId);
}

export function isProfileFollower(profile, viewerId) {
  if (!profile || !viewerId) {
    return false;
  }

  return (profile.FollowersList || []).some((id) => id?.toString?.() === viewerId);
}

export function canViewProfile(profile, viewerId) {
  if (!profile) {
    return false;
  }

  if (!isPrivateProfile(profile)) {
    return true;
  }

  return isProfileOwner(profile, viewerId) || isProfileFollower(profile, viewerId);
}

export function canCommentOnPost(authorProfile, viewerId) {
  if (!authorProfile) {
    return false;
  }

  if (!canViewProfile(authorProfile, viewerId)) {
    return false;
  }

  return authorProfile?.preferences?.allowComments !== false;
}

export function getFollowRelationship({
  targetProfile = null,
  viewerId = null,
  viewerProfile = null,
} = {}) {
  const targetId = targetProfile?.userid?.toString?.() || null;
  const currentViewerId = viewerId?.toString?.() || null;

  if (!targetId || !currentViewerId) {
    return {
      relationship: "none",
      isFollowing: false,
      isRequested: false,
      isSelf: false,
    };
  }

  if (targetId === currentViewerId) {
    return {
      relationship: "self",
      isFollowing: false,
      isRequested: false,
      isSelf: true,
    };
  }

  const followersList = Array.isArray(targetProfile?.FollowersList) ? targetProfile.FollowersList : [];
  const receivedRequests = Array.isArray(targetProfile?.FollowRequestsReceived) ? targetProfile.FollowRequestsReceived : [];
  const sentRequests = Array.isArray(viewerProfile?.FollowRequestsSent) ? viewerProfile.FollowRequestsSent : [];
  const viewerFollowing = Array.isArray(viewerProfile?.FollowingsList) ? viewerProfile.FollowingsList : [];

  const isFollowing = followersList.some((id) => id?.toString?.() === currentViewerId)
    || viewerFollowing.some((id) => id?.toString?.() === targetId);
  const isRequested = receivedRequests.some((id) => id?.toString?.() === currentViewerId)
    || sentRequests.some((id) => id?.toString?.() === targetId);

  return {
    relationship: isFollowing ? "following" : isRequested ? "requested" : "none",
    isFollowing,
    isRequested,
    isSelf: false,
  };
}

export function getFollowStatePayload({
  targetProfile = null,
  viewerId = null,
  viewerProfile = null,
} = {}) {
  const relationshipState = getFollowRelationship({ targetProfile, viewerId, viewerProfile });

  return {
    ...relationshipState,
    isPrivate: targetProfile?.preferences?.profileVisibility === "private",
    targetProfile,
  };
}

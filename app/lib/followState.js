import Follow from "@/app/models/Follow.model";

export async function getFollowRelationship({
  targetProfile = null,
  viewerId = null,
} = {}) {
  const targetId = targetProfile?.userid?.toString?.() || null;
  const currentViewerId = viewerId?.toString?.() || null;

  if (!targetId || !currentViewerId) {
    return {
      relationship: "none",
      isFollowing: false,
      isRequested: false,
      isFollowBack: false,
      isSelf: false,
    };
  }

  if (targetId === currentViewerId) {
    return {
      relationship: "self",
      isFollowing: false,
      isRequested: false,
      isFollowBack: false,
      isSelf: true,
    };
  }

  const [directRelation, reverseRelation] = await Promise.all([
    Follow.findOne({
      followerId: currentViewerId,
      followingId: targetId,
    }).lean(),
    Follow.findOne({
      followerId: targetId,
      followingId: currentViewerId,
      status: "following",
    }).lean(),
  ]);

  const directStatus = directRelation?.status || null;
  const isFollowing = directStatus === "following";
  const isRequested = directStatus === "requested";

  return {
    relationship: isFollowing ? "following" : isRequested ? "requested" : reverseRelation ? "follow_back" : "none",
    isFollowing,
    isRequested,
    isFollowBack: Boolean(reverseRelation && !isFollowing && !isRequested),
    isSelf: false,
  };
}

export async function getFollowStatePayload({
  targetProfile = null,
  viewerId = null,
} = {}) {
  const relationshipState = await getFollowRelationship({ targetProfile, viewerId });

  return {
    ...relationshipState,
    isPrivate: targetProfile?.preferences?.profileVisibility === "private",
    targetProfile,
  };
}

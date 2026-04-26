import Follow from "@/app/models/Follow.model";
import Profile from "@/app/models/Profile.model";
import { getProfileMapByUserIds, syncProfileCounters } from "@/app/lib/profileData";
import { enqueueNotificationEvent } from "@/app/lib/notifications/pipeline";
import { FeedFromFollow } from "@/app/api/users/createpost/FeedUpdate";

function isPrivateProfile(profile) {
  return profile?.preferences?.profileVisibility === "private";
}

function toId(value) {
  return value?.toString?.() || value?.toString?.() || String(value || "");
}

async function emitFollowNotificationSafe(event) {
  try {
    await enqueueNotificationEvent(event);
  } catch (error) {
    console.error("Notification emission failed:", {
      type: event?.type,
      recipientId: event?.recipientId,
      actorId: event?.actorId,
      message: error?.message || error,
    });
  }
}

async function getProfileSnapshot(userId) {
  return Profile.findOne(
    { userid: userId },
    {
      userid: 1,
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

function buildRelationshipPayload({
  directRelation = null,
  reverseRelation = null,
  targetProfile = null,
  viewerId = null,
} = {}) {
  const directStatus = directRelation?.status || null;
  const reverseFollowing = Boolean(reverseRelation && reverseRelation.status === "following");
  const relationship = directStatus || (reverseFollowing ? "follow_back" : "none");

  return {
    relationship,
    isFollowing: directStatus === "following",
    isRequested: directStatus === "requested",
    isFollowBack: !directStatus && reverseFollowing,
    isPrivate: isPrivateProfile(targetProfile),
    isSelf: Boolean(targetProfile?.userid && viewerId && toId(targetProfile.userid) === toId(viewerId)),
  };
}

function isSameUser(followerId, followingId) {
  return toId(followerId) === toId(followingId) && Boolean(toId(followerId));
}

async function syncFollowCounts(userId) {
  if (!userId) {
    return { Followers: 0, Followings: 0 };
  }

  const [Followers, Followings] = await Promise.all([
    Follow.countDocuments({ followingId: userId, status: "following" }),
    Follow.countDocuments({ followerId: userId, status: "following" }),
  ]);

  await Profile.updateOne(
    { userid: userId },
    {
      $set: {
        Followers,
        Followings,
      },
    }
  );

  await syncProfileCounters(userId);

  return { Followers, Followings };
}

async function updateLegacyProfileLists({
  followerId,
  followingId,
  status,
  mode,
}) {
  if (!followerId || !followingId) {
    return;
  }

  if (mode === "follow") {
    if (status === "following") {
      await Profile.updateOne(
        { userid: followingId },
        {
          $addToSet: { FollowersList: followerId },
          $pull: { FollowRequestsReceived: followerId },
        }
      );

      await Profile.updateOne(
        { userid: followerId },
        {
          $addToSet: { FollowingsList: followingId },
          $pull: { FollowRequestsSent: followingId },
        }
      );
      return;
    }

    await Profile.updateOne(
      { userid: followingId },
      { $addToSet: { FollowRequestsReceived: followerId } }
    );
    await Profile.updateOne(
      { userid: followerId },
      { $addToSet: { FollowRequestsSent: followingId } }
    );
    return;
  }

  if (mode === "remove") {
    await Profile.updateOne(
      { userid: followingId },
      {
        $pull: {
          FollowersList: followerId,
          FollowRequestsReceived: followerId,
        },
      }
    );

    await Profile.updateOne(
      { userid: followerId },
      {
        $pull: {
          FollowingsList: followingId,
          FollowRequestsSent: followingId,
        },
      }
    );
  }
}

async function upsertFollowRelation({ followerId, followingId, status }) {
  const directRelation = await Follow.findOne({ followerId, followingId }).lean();
  const reverseRelation = await Follow.findOne({
    followerId: followingId,
    followingId: followerId,
    status: "following",
  }).lean();

  const targetProfile = await Profile.findOne(
    { userid: followingId },
    { preferences: 1, username: 1 }
  ).lean();

  if (!targetProfile) {
    return null;
  }

  const targetPrivate = isPrivateProfile(targetProfile);
  const nextStatus = status || (targetPrivate ? "requested" : "following");

  const relation = await Follow.findOneAndUpdate(
    { followerId, followingId },
    {
      $setOnInsert: { followerId, followingId },
      $set: {
        status: nextStatus,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  ).lean();

  await updateLegacyProfileLists({
    followerId,
    followingId,
    status: relation?.status || nextStatus,
    mode: "follow",
  });

  await Promise.all([syncFollowCounts(followerId), syncFollowCounts(followingId)]);

  const actorProfile = await getProfileSnapshot(followerId);
  const targetSnapshot = await getProfileSnapshot(followingId);

  return {
    relation,
    actorProfile,
    targetProfile: targetSnapshot,
    payload: buildRelationshipPayload({
      directRelation: relation,
      reverseRelation,
      targetProfile,
      viewerId: followerId,
    }),
    nextStatus: relation?.status || nextStatus,
    wasNew: !directRelation,
    targetPrivate,
  };
}

export async function getFollowRelationshipState({ viewerId, targetId }) {
  if (!viewerId || !targetId) {
    return buildRelationshipPayload();
  }

  const [directRelation, reverseRelation, targetProfile] = await Promise.all([
    Follow.findOne({ followerId: viewerId, followingId: targetId }).lean(),
    Follow.findOne({
      followerId: targetId,
      followingId: viewerId,
      status: "following",
    }).lean(),
    Profile.findOne({ userid: targetId }, { preferences: 1, userid: 1 }).lean(),
  ]);

  return buildRelationshipPayload({
    directRelation,
    reverseRelation,
    targetProfile,
    viewerId,
  });
}

export async function followUserRelationship({ followerId, followingId }) {
  if (isSameUser(followerId, followingId)) {
    return {
      message: "You cannot follow yourself",
      relationship: "self",
      isFollowing: false,
      isRequested: false,
      isFollowBack: false,
      isSelf: true,
      noOp: true,
      actorProfile: await getProfileSnapshot(followerId),
      targetProfile: await getProfileSnapshot(followingId),
    };
  }

  const state = await upsertFollowRelation({ followerId, followingId });
  if (!state) {
    return null;
  }

  const { targetPrivate, nextStatus, wasNew, actorProfile, targetProfile } = state;

  if (wasNew && nextStatus === "requested") {
    await emitFollowNotificationSafe({
      type: "follow_request",
      recipientId: followingId,
      actorId: followerId,
      entityType: "profile",
      entityId: followingId,
      groupKey: `follow_request:${followingId}:${followerId}`,
      actorSnapshot: {
        userid: followerId,
        username: actorProfile?.username || null,
        FirstName: actorProfile?.FirstName || null,
        profileImageUrl: actorProfile?.profileImageUrl || null,
      },
      message: `${actorProfile?.FirstName || actorProfile?.username || "Someone"} sent you a follow request`,
    });
  }

  if (nextStatus === "following" && !state.payload.isFollowing) {
    const targetFollowingProfile = await getProfileSnapshot(followingId);
    await FeedFromFollow(followerId, followingId, targetFollowingProfile?.username || targetProfile?.username);
  }

  if (wasNew && nextStatus === "following") {
    await emitFollowNotificationSafe({
      type: "follow",
      recipientId: followingId,
      actorId: followerId,
      entityType: "profile",
      entityId: followingId,
      groupKey: `follow:${followingId}:${followerId}`,
      actorSnapshot: {
        userid: followerId,
        username: actorProfile?.username || null,
        FirstName: actorProfile?.FirstName || null,
        profileImageUrl: actorProfile?.profileImageUrl || null,
      },
      message: `${actorProfile?.FirstName || actorProfile?.username || "Someone"} followed you`,
    });
  }

  return {
    message: nextStatus === "requested" ? "Follow request sent" : "Followed successfully",
    ...state.payload,
    actorProfile: state.actorProfile,
    targetProfile: state.targetProfile,
    relationship: state.payload.relationship,
    isFollowing: state.payload.isFollowing,
    isRequested: state.payload.isRequested,
    isFollowBack: state.payload.isFollowBack,
    isPrivate: state.payload.isPrivate || targetPrivate,
    wasNew,
  };
}

export async function unfollowUserRelationship({ followerId, followingId }) {
  if (isSameUser(followerId, followingId)) {
    return {
      message: "You cannot unfollow yourself",
      relationship: "self",
      isFollowing: false,
      isRequested: false,
      isFollowBack: false,
      isSelf: true,
      noOp: true,
      actorProfile: await getProfileSnapshot(followerId),
      targetProfile: await getProfileSnapshot(followingId),
    };
  }

  const existing = await Follow.findOne({ followerId, followingId }).lean();
  if (!existing) {
    return {
      message: "No existing follow relationship",
      relationship: "none",
      isFollowing: false,
      isRequested: false,
      isFollowBack: false,
      actorProfile: await getProfileSnapshot(followerId),
      targetProfile: await getProfileSnapshot(followingId),
    };
  }

  await Follow.deleteOne({ followerId, followingId });
  await updateLegacyProfileLists({ followerId, followingId, mode: "remove" });
  await Promise.all([syncFollowCounts(followerId), syncFollowCounts(followingId)]);

  return {
    message: existing.status === "requested" ? "Follow request canceled" : "Unfollowed successfully",
    relationship: "none",
    isFollowing: false,
    isRequested: false,
    isFollowBack: false,
    actorProfile: await getProfileSnapshot(followerId),
    targetProfile: await getProfileSnapshot(followingId),
  };
}

export async function acceptFollowRequest({ recipientId, requesterId }) {
  const relation = await Follow.findOneAndUpdate(
    { followerId: requesterId, followingId: recipientId, status: "requested" },
    {
      $set: { status: "following" },
    },
    {
      returnDocument: "after",
    }
  ).lean();

  if (!relation) {
    return {
      message: "No pending request found",
      relationship: "none",
      isFollowing: false,
      isRequested: false,
      actorProfile: await getProfileSnapshot(recipientId),
      targetProfile: await getProfileSnapshot(requesterId),
      noOp: true,
    };
  }

  await updateLegacyProfileLists({
    followerId: requesterId,
    followingId: recipientId,
    status: "following",
    mode: "follow",
  });

  await Promise.all([syncFollowCounts(requesterId), syncFollowCounts(recipientId)]);

  const actorProfile = await getProfileSnapshot(recipientId);
  const targetProfile = await getProfileSnapshot(requesterId);

  await FeedFromFollow(requesterId, recipientId, actorProfile?.username);
  await emitFollowNotificationSafe({
    type: "follow_request_accepted",
    recipientId: requesterId,
    actorId: recipientId,
    entityType: "profile",
    entityId: recipientId,
    groupKey: `follow_request_accepted:${requesterId}:${recipientId}`,
    actorSnapshot: {
      userid: recipientId,
      username: actorProfile?.username || null,
      FirstName: actorProfile?.FirstName || null,
      profileImageUrl: actorProfile?.profileImageUrl || null,
    },
    message: `${actorProfile?.FirstName || actorProfile?.username || "Someone"} accepted your follow request`,
  });

  return {
    message: "Request accepted",
    relationship: "following",
    isFollowing: true,
    isRequested: false,
    actorProfile,
    targetProfile,
  };
}

export async function declineFollowRequest({ recipientId, requesterId }) {
  const relation = await Follow.findOne({ followerId: requesterId, followingId: recipientId, status: "requested" }).lean();

  if (!relation) {
    return {
      message: "No pending request found",
      relationship: "none",
      isFollowing: false,
      isRequested: false,
      actorProfile: await getProfileSnapshot(recipientId),
      targetProfile: await getProfileSnapshot(requesterId),
      noOp: true,
    };
  }

  await Follow.deleteOne({ followerId: requesterId, followingId: recipientId, status: "requested" });
  await updateLegacyProfileLists({
    followerId: requesterId,
    followingId: recipientId,
    mode: "remove",
  });
  await Promise.all([syncFollowCounts(requesterId), syncFollowCounts(recipientId)]);

  return {
    message: "Request declined",
    relationship: "none",
    isFollowing: false,
    isRequested: false,
    actorProfile: await getProfileSnapshot(recipientId),
    targetProfile: await getProfileSnapshot(requesterId),
  };
}

export async function cancelFollowRequest({ followerId, followingId }) {
  const relation = await Follow.findOne({ followerId, followingId, status: "requested" }).lean();

  if (!relation) {
    return {
      message: "No pending request found",
      relationship: "none",
      isFollowing: false,
      isRequested: false,
      actorProfile: await getProfileSnapshot(followerId),
      targetProfile: await getProfileSnapshot(followingId),
      noOp: true,
    };
  }

  await Follow.deleteOne({ followerId, followingId, status: "requested" });
  await updateLegacyProfileLists({
    followerId,
    followingId,
    mode: "remove",
  });
  await Promise.all([syncFollowCounts(followerId), syncFollowCounts(followingId)]);

  return {
    message: "Follow request canceled",
    relationship: "none",
    isFollowing: false,
    isRequested: false,
    actorProfile: await getProfileSnapshot(followerId),
    targetProfile: await getProfileSnapshot(followingId),
  };
}

export async function removeFollower({ ownerId, followerId }) {
  const relation = await Follow.findOne({ followerId, followingId: ownerId, status: "following" }).lean();

  if (!relation) {
    return {
      message: "No follower relationship found",
      relationship: "none",
      isFollowing: false,
      isRequested: false,
      actorProfile: await getProfileSnapshot(ownerId),
      targetProfile: await getProfileSnapshot(followerId),
      noOp: true,
    };
  }

  await Follow.deleteOne({ followerId, followingId: ownerId, status: "following" });
  await updateLegacyProfileLists({
    followerId,
    followingId: ownerId,
    mode: "remove",
  });
  await Promise.all([syncFollowCounts(ownerId), syncFollowCounts(followerId)]);

  return {
    message: "Follower removed",
    relationship: "none",
    isFollowing: false,
    isRequested: false,
    actorProfile: await getProfileSnapshot(ownerId),
    targetProfile: await getProfileSnapshot(followerId),
  };
}

export async function getPendingFollowRequests(userId) {
  const requests = await Follow.find(
    { followingId: userId, status: "requested" },
    { followerId: 1, followingId: 1, createdAt: 1, updatedAt: 1 }
  ).sort({ createdAt: -1 }).lean();

  if (requests.length === 0) {
    return [];
  }

  const requesterIds = requests.map((request) => request.followerId);
  const profileMap = await getProfileMapByUserIds(requesterIds);

  return requests
    .map((request) => {
      const profile = profileMap.get(request.followerId);
      if (!profile) {
        return null;
      }

      return {
        ...profile,
        requestId: `${request.followerId}:${request.followingId}`,
        requestedAt: request.createdAt,
      };
    })
    .filter(Boolean);
}

export async function getFollowersForUser(userId) {
  const relationships = await Follow.find(
    { followingId: userId, status: "following" },
    { followerId: 1, createdAt: 1 }
  ).sort({ createdAt: -1 }).lean();

  const ids = relationships.map((item) => item.followerId);
  const profileMap = await getProfileMapByUserIds(ids);
  return ids.map((id) => profileMap.get(id)).filter(Boolean);
}

export async function getFollowingsForUser(userId) {
  const relationships = await Follow.find(
    { followerId: userId, status: "following" },
    { followingId: 1, createdAt: 1 }
  ).sort({ createdAt: -1 }).lean();

  const ids = relationships.map((item) => item.followingId);
  const profileMap = await getProfileMapByUserIds(ids);
  return ids.map((id) => profileMap.get(id)).filter(Boolean);
}

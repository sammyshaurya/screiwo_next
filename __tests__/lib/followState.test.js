import { getFollowRelationship } from "@/app/lib/followState";

describe("follow state helper", () => {
  it("returns self for the same user", () => {
    const state = getFollowRelationship({
      targetProfile: { userid: "user_1", FollowersList: [], FollowRequestsReceived: [] },
      viewerId: "user_1",
    });

    expect(state.relationship).toBe("self");
    expect(state.isSelf).toBe(true);
  });

  it("returns following when the viewer exists in followers", () => {
    const state = getFollowRelationship({
      targetProfile: { userid: "user_2", FollowersList: ["user_1"], FollowRequestsReceived: [] },
      viewerId: "user_1",
    });

    expect(state.relationship).toBe("following");
    expect(state.isFollowing).toBe(true);
  });

  it("returns requested when the viewer has a pending request", () => {
    const state = getFollowRelationship({
      targetProfile: { userid: "user_2", FollowersList: [], FollowRequestsReceived: ["user_1"] },
      viewerId: "user_1",
    });

    expect(state.relationship).toBe("requested");
    expect(state.isRequested).toBe(true);
  });
});

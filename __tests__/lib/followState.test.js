import Follow from "@/app/models/Follow.model";
import { getFollowRelationship, getFollowStatePayload } from "@/app/lib/followState";

jest.mock("@/app/models/Follow.model", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

describe("follow state helper", () => {
  beforeEach(() => {
    Follow.findOne.mockReset();
  });

  function makeLeanQuery(result) {
    return {
      lean: jest.fn().mockResolvedValue(result),
    };
  }

  it("returns self for the same user", async () => {
    const state = await getFollowRelationship({
      targetProfile: { userid: "user_1" },
      viewerId: "user_1",
    });

    expect(state.relationship).toBe("self");
    expect(state.isSelf).toBe(true);
  });

  it("returns following when a direct relation exists", async () => {
    Follow.findOne
      .mockReturnValueOnce(makeLeanQuery({ status: "following" }))
      .mockReturnValueOnce(makeLeanQuery(null));

    const state = await getFollowRelationship({
      targetProfile: { userid: "user_2" },
      viewerId: "user_1",
    });

    expect(Follow.findOne).toHaveBeenCalledWith({
      followerId: "user_1",
      followingId: "user_2",
    });
    expect(state.relationship).toBe("following");
    expect(state.isFollowing).toBe(true);
  });

  it("returns requested when a direct request exists", async () => {
    Follow.findOne
      .mockReturnValueOnce(makeLeanQuery({ status: "requested" }))
      .mockReturnValueOnce(makeLeanQuery(null));

    const state = await getFollowRelationship({
      targetProfile: { userid: "user_2" },
      viewerId: "user_1",
    });

    expect(state.relationship).toBe("requested");
    expect(state.isRequested).toBe(true);
  });

  it("returns follow_back when the reverse relation exists", async () => {
    Follow.findOne
      .mockReturnValueOnce(makeLeanQuery(null))
      .mockReturnValueOnce(makeLeanQuery({ status: "following" }));

    const state = await getFollowRelationship({
      targetProfile: { userid: "user_2" },
      viewerId: "user_1",
    });

    expect(state.relationship).toBe("follow_back");
    expect(state.isFollowBack).toBe(true);
  });

  it("returns profile metadata in the payload", async () => {
    Follow.findOne
      .mockReturnValueOnce(makeLeanQuery({ status: "following" }))
      .mockReturnValueOnce(makeLeanQuery(null));

    const payload = await getFollowStatePayload({
      targetProfile: {
        userid: "user_2",
        preferences: { profileVisibility: "private" },
      },
      viewerId: "user_1",
    });

    expect(payload.isPrivate).toBe(true);
    expect(payload.relationship).toBe("following");
  });
});

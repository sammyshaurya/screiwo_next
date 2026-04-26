import Follow from "@/app/models/Follow.model";
import Profile from "@/app/models/Profile.model";
import Posts from "@/app/models/Posts.model";
import {
  getLiveProfileCounts,
  syncProfileCounters,
  toProfileSummary,
} from "@/app/lib/profileData";

jest.mock("@/app/models/Follow.model", () => ({
  __esModule: true,
  default: {
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock("@/app/models/Profile.model", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  },
}));

jest.mock("@/app/models/Posts.model", () => ({
  __esModule: true,
  default: {
    countDocuments: jest.fn(),
  },
}));

describe("profile data helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses canonical follow counts instead of legacy profile values", async () => {
    Follow.aggregate
      .mockResolvedValueOnce([{ _id: "user_1", count: 3 }])
      .mockResolvedValueOnce([{ _id: "user_1", count: 1 }]);

    const counts = await getLiveProfileCounts({
      userid: "user_1",
      Followers: 9,
      Followings: 7,
      postCount: 2,
    });

    expect(counts).toEqual({
      Followers: 3,
      Followings: 1,
      postCount: 2,
      postsCount: 2,
    });
  });

  it("hydrates profile summaries with live counts", async () => {
    Follow.aggregate
      .mockResolvedValueOnce([{ _id: "user_2", count: 4 }])
      .mockResolvedValueOnce([{ _id: "user_2", count: 5 }]);

    const summary = await toProfileSummary({
      userid: "user_2",
      username: "sammy",
      FirstName: "Sam",
      LastName: "My",
      profileImageUrl: null,
      profileType: "Personal",
      Bio: "Writer",
      Followers: 0,
      Followings: 0,
      postCount: 11,
    });

    expect(summary.Followers).toBe(4);
    expect(summary.Followings).toBe(5);
    expect(summary.postCount).toBe(11);
  });

  it("reconciles profile counters from the canonical Follow collection", async () => {
    Profile.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        FollowersList: ["stale_follower"],
        FollowingsList: ["stale_following"],
        FollowRequestsReceived: ["stale_request"],
        FollowRequestsSent: ["stale_sent"],
      }),
    });
    Posts.countDocuments.mockResolvedValue(6);
    Follow.aggregate
      .mockResolvedValueOnce([{ _id: "user_3", count: 2 }])
      .mockResolvedValueOnce([{ _id: "user_3", count: 3 }]);
    Follow.find
      .mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue([{ followerId: "f1" }, { followerId: "f2" }]),
      })
      .mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue([{ followingId: "g1" }, { followingId: "g2" }, { followingId: "g3" }]),
      })
      .mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue([{ followerId: "r1" }]),
      })
      .mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue([{ followingId: "s1" }]),
      });
    Profile.updateOne.mockResolvedValue({ acknowledged: true });

    const counters = await syncProfileCounters("user_3");

    expect(counters).toEqual({
      Followers: 2,
      Followings: 3,
      postCount: 6,
      postsCount: 6,
    });
    expect(Profile.updateOne).toHaveBeenCalledWith(
      { userid: "user_3" },
      {
        $set: {
          Followers: 2,
          Followings: 3,
          postCount: 6,
        },
      }
    );
    expect(Profile.updateOne).toHaveBeenCalledWith(
      { userid: "user_3" },
      {
        $set: {
          FollowersList: ["f1", "f2"],
          FollowingsList: ["g1", "g2", "g3"],
          FollowRequestsReceived: ["r1"],
          FollowRequestsSent: ["s1"],
        },
      }
    );
  });
});

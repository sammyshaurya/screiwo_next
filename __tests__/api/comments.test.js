jest.mock('@/app/lib/db', () => ({
  connectDB: jest.fn(),
}))

jest.mock('@/app/models/Comment.model', () => ({
  __esModule: true,
  default: Object.assign(
    jest.fn((data) => ({
      ...data,
      _id: 'comment_2',
      save: jest.fn().mockResolvedValue(undefined),
      toObject: () => ({ _id: 'comment_2', ...data }),
    })),
    {
      find: jest.fn(),
      findById: jest.fn(),
      countDocuments: jest.fn(),
    }
  ),
}))

jest.mock('@/app/models/Posts.model', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}))

jest.mock('@/app/models/Notification.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}))

jest.mock('@/app/lib/notifications/pipeline', () => ({
  enqueueNotificationEvent: jest.fn().mockResolvedValue({ queued: true }),
}))

jest.mock('@/app/models/Activity.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}))

jest.mock('@/app/models/Profile.model', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findOne: jest.fn(),
  },
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

import { GET, POST } from '@/app/api/posts/comment/route'
import Comment from '@/app/models/Comment.model'
import Posts from '@/app/models/Posts.model'
import Notification from '@/app/models/Notification.model'
import Activity from '@/app/models/Activity.model'
import Profile from '@/app/models/Profile.model'
import { enqueueNotificationEvent } from '@/app/lib/notifications/pipeline'
import { auth } from '@clerk/nextjs/server'

function makeQuery(result) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  }
}

describe('Comments API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    auth.mockResolvedValue({ userId: 'user_123' })
  })

  it('hydrates comment authors from profiles using Clerk IDs', async () => {
    Comment.find
      .mockReturnValueOnce(makeQuery([
        {
          _id: 'comment_1',
          userId: 'user_123',
          text: 'Top level',
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ]))
      .mockReturnValueOnce(makeQuery([
        {
          _id: 'reply_1',
          userId: 'user_456',
          text: 'Reply',
          createdAt: '2025-01-01T00:10:00.000Z',
        },
      ]))

    Comment.countDocuments.mockResolvedValue(1)
    Profile.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { userid: 'user_123', username: 'alice', FirstName: 'Alice', LastName: 'A', profileImageUrl: '/a.png' },
        { userid: 'user_456', username: 'bob', FirstName: 'Bob', LastName: 'B', profileImageUrl: '/b.png' },
      ]),
    })

    const response = await GET({
      url: 'http://localhost/api/posts/comment?postId=post_1&page=1&limit=10',
    })
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.comments[0].userId.userid).toBe('user_123')
    expect(payload.comments[0].replies[0].userId.userid).toBe('user_456')
  })

  it('creates a comment using the Clerk user id and sends notification with profile-derived author name', async () => {
    Posts.findById.mockResolvedValue({
      userid: 'user_999',
      commentscount: 0,
      save: jest.fn().mockResolvedValue(undefined),
    })
    Profile.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        userid: 'user_123',
        username: 'alice',
        FirstName: 'Alice',
        LastName: 'Anderson',
        profileImageUrl: '/a.png',
      }),
    })
    Comment.findById.mockResolvedValue(null)

    const response = await POST({
      json: jest.fn().mockResolvedValue({
        postId: 'post_1',
        text: 'Hello there',
      }),
    })
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(Comment).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_123',
        postId: 'post_1',
        text: 'Hello there',
      })
    )
    expect(Activity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user_123',
        type: 'post_comment',
      })
    )
    expect(enqueueNotificationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: 'user_999',
        actorId: 'user_123',
        type: 'comment',
        message: expect.stringContaining('Alice'),
      })
    )
    expect(payload.comment.userId.userid).toBe('user_123')
  })
})

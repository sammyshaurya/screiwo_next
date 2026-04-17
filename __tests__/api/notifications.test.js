import { GET } from '@/app/api/notifications/route'
import { POST } from '@/app/api/notifications/read/route'
import Notification from '@/app/models/Notification.model'
import Posts from '@/app/models/Posts.model'
import Profile from '@/app/models/Profile.model'
import { auth } from '@clerk/nextjs/server'

jest.mock('@/app/lib/db', () => ({
  connectDB: jest.fn(),
}))

jest.mock('@/app/models/Notification.model', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  },
}))

jest.mock('@/app/models/Posts.model', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}))

jest.mock('@/app/models/Profile.model', () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
  },
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

function makeQuery(result) {
  return {
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(result),
  }
}

describe('Notifications API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    auth.mockResolvedValue({ userId: 'user_123' })
  })

  it('hydrates actor profiles for notifications using Clerk user ids', async () => {
    Notification.find.mockReturnValue(
      makeQuery([
        {
          _id: 'notif_1',
          userId: 'user_123',
          fromUserId: 'user_456',
          postId: 'post_1',
          type: 'like',
          read: false,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ])
    )
    Notification.countDocuments
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)
    Profile.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          userid: 'user_456',
          username: 'bob',
          FirstName: 'Bob',
          LastName: 'B',
          profileImageUrl: '/b.png',
        },
      ]),
    })
    Posts.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ _id: 'post_1', title: 'Hello' }]),
    })

    const response = await GET({
      url: 'http://localhost/api/notifications?page=1&limit=20',
    })
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.notifications[0].fromUserId.username).toBe('bob')
    expect(payload.notifications[0].postId.title).toBe('Hello')
  })

  it('marks only the current user’s notification as read', async () => {
    Notification.findOneAndUpdate.mockResolvedValue({
      _id: 'notif_1',
      userId: 'user_123',
      read: true,
    })

    const response = await POST({
      json: jest.fn().mockResolvedValue({
        notificationId: 'notif_1',
        readAll: false,
      }),
    })
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'notif_1', userId: 'user_123' },
      { read: true },
      { new: true }
    )
    expect(payload.notification.read).toBe(true)
  })
})

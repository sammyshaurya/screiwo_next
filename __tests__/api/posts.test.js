import { PATCH, DELETE } from '@/app/api/posts/manage/route'
import Posts from '@/app/models/Posts.model'
import Profile from '@/app/models/Profile.model'
import Feed from '@/app/models/Feed.model'
import { auth } from '@clerk/nextjs/server'

jest.mock('@/app/lib/db', () => ({
  connectDB: jest.fn(),
}))

jest.mock('@/app/models/Posts.model', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}))

jest.mock('@/app/models/Profile.model', () => ({
  __esModule: true,
  default: {
    updateOne: jest.fn(),
  },
}))

jest.mock('@/app/models/Feed.model', () => ({
  __esModule: true,
  default: {
    updateMany: jest.fn(),
  },
}))

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))

describe('Posts API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    auth.mockResolvedValue({ userId: 'user_123' })
  })

  it('syncs edits to the canonical post and keeps feed references intact', async () => {
    const save = jest.fn()
    const post = {
      _id: 'post_1',
      userid: 'user_123',
      title: 'Old title',
      content: 'Old content',
      save,
    }
    Posts.findById.mockResolvedValue(post)
    Feed.updateMany.mockResolvedValue({ acknowledged: true })

    const request = {
      json: jest.fn().mockResolvedValue({
        postId: 'post_1',
        title: 'New title',
        content: 'New content',
      }),
    }

    const response = await PATCH(request)
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(save).toHaveBeenCalled()
    expect(post.contentText).toBe('New content')
    expect(post.excerpt).toBe('New content')
    expect(Feed.updateMany).toHaveBeenCalledWith(
      { 'items.postId': 'post_1' },
      expect.objectContaining({
        $set: expect.objectContaining({
          'items.$[item].rankReason': 'edited',
        }),
      }),
      {
        arrayFilters: [{ 'item.postId': 'post_1' }],
      }
    )
    expect(payload.post.title).toBe('New title')
  })

  it('soft deletes the post, decrements the author post count, and removes feed entries', async () => {
    const save = jest.fn()
    const post = {
      _id: 'post_2',
      userid: 'user_123',
      save,
    }
    Posts.findById.mockResolvedValue(post)
    Profile.updateOne.mockResolvedValue({ acknowledged: true })
    Feed.updateMany.mockResolvedValue({ acknowledged: true })

    const response = await DELETE({
      url: 'http://localhost/api/posts/manage?id=post_2',
    })
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(save).toHaveBeenCalled()
    expect(Profile.updateOne).toHaveBeenCalledWith(
      { userid: 'user_123' },
      { $inc: { postCount: -1 } }
    )
    expect(Feed.updateMany).toHaveBeenCalledWith(
      { 'items.postId': 'post_2' },
      { $pull: { items: { postId: 'post_2' } } }
    )
    expect(payload.message).toMatch(/deleted/i)
  })
})

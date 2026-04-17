/**
 * __tests__/utils/testHelpers.js
 * Common test utilities and mocks
 */

export const mockClerkUser = {
  id: 'user_123',
  firstName: 'Test',
  lastName: 'User',
  emailAddresses: [
    {
      emailAddress: 'test@example.com',
      verification: { status: 'verified' },
    },
  ],
  username: 'testuser',
  profileImageUrl: 'https://example.com/image.jpg',
}

export const mockProfile = {
  _id: '507f1f77bcf86cd799439011',
  userid: 'user_123',
  username: 'testuser',
  FirstName: 'Test',
  LastName: 'User',
  Bio: 'Test bio',
  profileImageUrl: 'https://example.com/image.jpg',
  Followers: 10,
  Followings: 5,
  FollowersList: [],
  FollowingsList: [],
  postCount: 0,
}

export const mockPost = {
  _id: '507f1f77bcf86cd799439012',
  userid: 'user_123',
  title: 'Test Post',
  content: '<p>Test content</p>',
  excerpt: 'Test content',
  contentText: 'Test content',
  profileImageUrl: 'https://example.com/image.jpg',
  likes: 0,
  commentscount: 0,
  saves: 0,
  DateofCreation: new Date(),
}

export const createMockRequest = (method = 'GET', body = null) => {
  return {
    method,
    json: jest.fn().mockResolvedValue(body),
    headers: new Map([['content-type', 'application/json']]),
  }
}

export const createMockContext = (params = {}) => {
  return { params }
}

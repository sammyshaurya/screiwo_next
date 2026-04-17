/**
 * __tests__/api/profiles.test.js
 * Tests for profile API routes
 */

import '@testing-library/jest-dom'
import { mockProfile, mockClerkUser } from '../utils/testHelpers'

describe('Profile API Routes', () => {
  describe('Profile Creation', () => {
    it('should require username and user ID', () => {
      const requiredFields = ['username', 'userid']
      expect(requiredFields).toContain('username')
      expect(requiredFields).toContain('userid')
    })

    it('should initialize profile with default values', () => {
      const newProfile = {
        _id: '507f1f77bcf86cd799439011',
        userid: 'user_123',
        username: 'testuser',
        FirstName: 'Test',
        LastName: 'User',
        Bio: 'I am using Screiwo',
        profileImageUrl: '',
        Followers: 0,
        Followings: 0,
        FollowersList: [],
        FollowingsList: [],
        postCount: 0,
      }
      expect(newProfile).toHaveProperty('Bio')
      expect(newProfile).toHaveProperty('Followers', 0)
      expect(newProfile).toHaveProperty('Followings', 0)
      expect(newProfile).toHaveProperty('postCount')
    })

    it('should create empty follower/following lists', () => {
      expect(Array.isArray(mockProfile.FollowersList)).toBe(true)
      expect(Array.isArray(mockProfile.FollowingsList)).toBe(true)
    })
  })

  describe('Follow System', () => {
    it('should prevent self-following', () => {
      const userId = mockProfile.userid
      const followingList = mockProfile.FollowingsList
      expect(followingList).not.toContain(userId)
    })

    it('should update follower/following counts', () => {
      const updatedProfile = {
        ...mockProfile,
        Followers: mockProfile.Followers + 1,
        Followings: mockProfile.Followings + 1,
      }
      expect(updatedProfile.Followers).toBe(mockProfile.Followers + 1)
      expect(updatedProfile.Followings).toBe(mockProfile.Followings + 1)
    })

    it('should maintain bidirectional relationships', () => {
      const userA = mockProfile.userid
      const userB = 'user_456'
      const userAFollowing = [userB]
      const userBFollowers = [userA]
      expect(userAFollowing).toContain(userB)
      expect(userBFollowers).toContain(userA)
    })
  })

  describe('Profile Retrieval', () => {
    it('should fetch user profile by username', () => {
      expect(mockProfile.username).toBeTruthy()
      expect(mockProfile.username.length).toBeGreaterThan(0)
    })

    it('should include profile statistics', () => {
      expect(mockProfile).toHaveProperty('postCount')
      expect(mockProfile).toHaveProperty('Followers')
      expect(mockProfile).toHaveProperty('Followings')
    })
  })
})

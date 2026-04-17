import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import CommentsSection from '@/app/components/Pages/CommentsSection'

jest.mock('@/app/lib/api', () => ({
  getComments: jest.fn(),
  createComment: jest.fn(),
  deleteComment: jest.fn(),
}))

import { getComments, deleteComment } from '@/app/lib/api'

describe('CommentsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows delete controls when the current Clerk user matches the hydrated comment userid', async () => {
    getComments.mockResolvedValue({
      comments: [
        {
          _id: 'comment_1',
          text: 'Hello',
          createdAt: '2025-01-01T00:00:00.000Z',
          likesCount: 0,
          userId: {
            userid: 'user_123',
            username: 'alice',
            FirstName: 'Alice',
            LastName: 'A',
            profileImageUrl: '/a.png',
          },
          replies: [],
        },
      ],
    })

    render(
      <CommentsSection
        postId="post_1"
        currentUserId="user_123"
        currentUserName="Alice"
        currentUserImage="/a.png"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button')
    expect(deleteButtons.some((button) => button.querySelector('svg'))).toBe(true)
  })

  it('calls deleteComment for the selected comment', async () => {
    getComments.mockResolvedValue({
      comments: [
        {
          _id: 'comment_1',
          text: 'Delete me',
          createdAt: '2025-01-01T00:00:00.000Z',
          likesCount: 0,
          userId: {
            userid: 'user_123',
            username: 'alice',
            FirstName: 'Alice',
            LastName: 'A',
            profileImageUrl: '/a.png',
          },
          replies: [],
        },
      ],
    })
    deleteComment.mockResolvedValue({ success: true })

    render(
      <CommentsSection
        postId="post_1"
        currentUserId="user_123"
        currentUserName="Alice"
        currentUserImage="/a.png"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Delete me')).toBeInTheDocument()
    })

    const deleteButton = screen.getAllByRole('button').find((button) => button.className.includes('hover:text-red-600'))
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(deleteComment).toHaveBeenCalledWith('comment_1')
    })
  })
})

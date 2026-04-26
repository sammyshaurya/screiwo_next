import axios from 'axios';

const API_BASE = '/api';

// Create axios instance with default headers
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// LIKE & UNLIKE
export const likePost = async (postId) => {
  try {
    const response = await apiClient.post('/posts/like', { postId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const unlikePost = async (postId) => {
  try {
    const response = await apiClient.post('/posts/unlike', { postId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// COMMENTS
export const getComments = async (postId, page = 1, limit = 10) => {
  try {
    const response = await apiClient.get('/posts/comment', {
      params: { postId, page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createComment = async (postId, text, parentCommentId = null) => {
  try {
    const response = await apiClient.post('/posts/comment', {
      postId,
      text,
      parentCommentId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await apiClient.delete('/posts/comment/delete', {
      params: { id: commentId },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// BOOKMARKS
export const getBookmarks = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get('/posts/bookmark', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const bookmarkPost = async (postId) => {
  try {
    const response = await apiClient.post('/posts/bookmark', { postId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const unbookmarkPost = async (postId) => {
  try {
    const response = await apiClient.post('/posts/unbookmark', { postId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// FOLLOWS
export const followUser = async (followUserId) => {
  try {
    const response = await apiClient.post(`/users/${followUserId}/follow`);
    return response.data;
  } catch (error) {
    const normalized = error.response?.data || { message: error.message || 'Follow request failed' };
    throw normalized;
  }
};

export const unfollowUser = async (followUserId) => {
  try {
    const response = await apiClient.post(`/users/${followUserId}/unfollow`);
    return response.data;
  } catch (error) {
    const normalized = error.response?.data || { message: error.message || 'Unfollow request failed' };
    throw normalized;
  }
};

export const getFollowRequests = async () => {
  try {
    const response = await apiClient.get('/profile/follow/requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFollowStatus = async (followUserId = null, username = null) => {
  try {
    const response = await apiClient.get('/profile/follow/status', {
      params: {
        followUser: followUserId || undefined,
        username: username || undefined,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const acceptFollowRequest = async (requestUserId) => {
  try {
    const response = await apiClient.post(`/requests/${requestUserId}/accept`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const declineFollowRequest = async (requestUserId) => {
  try {
    const response = await apiClient.post(`/requests/${requestUserId}/decline`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const cancelFollowRequest = async (followUserId) => {
  try {
    const response = await apiClient.post(`/users/${followUserId}/request/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const removeFollower = async (ownerId, followerId) => {
  try {
    const response = await apiClient.delete(`/users/${ownerId}/followers/${followerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// NOTIFICATIONS
export const getNotifications = async (page = 1, limit = 20) => {
  try {
    const response = await apiClient.get('/notifications', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const markNotificationAsRead = async (notificationId = null, readAll = false) => {
  try {
    const response = await apiClient.post('/notifications/read', {
      notificationId,
      readAll,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await apiClient.get('/notifications/summary');
    return parseInt(response.data?.unreadCount || 0, 10);
  } catch (error) {
    return 0;
  }
};

export const getNotificationSummary = async () => {
  try {
    const response = await apiClient.get('/notifications/summary');
    return {
      unreadCount: parseInt(response.data?.unreadCount || 0, 10),
      requestCount: parseInt(response.data?.requestCount || 0, 10),
    };
  } catch (error) {
    return { unreadCount: 0, requestCount: 0 };
  }
};

// POST MANAGEMENT
export const editPost = async (postId, title, content) => {
  try {
    const response = await apiClient.patch('/posts/manage', {
      postId,
      title,
      content,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await apiClient.delete('/posts/manage', {
      params: { id: postId },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// RECOMMENDATIONS
export const getRecommendedFeed = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get('/feed/recommended', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default apiClient;

import React from 'react';
import { TrendingUp, Heart, MessageCircle, Eye, Star } from 'lucide-react';

const RightSidebar = () => {
  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-pink-100 border-b border-gray-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-red-500" />
          <h3 className="font-bold text-gray-900 text-sm">TRENDING NOW</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { tag: '#ReactJS', posts: '4.2K', color: 'blue' },
            { tag: '#WebDesign', posts: '3.8K', color: 'purple' },
            { tag: '#Programming', posts: '12.5K', color: 'green' },
            { tag: '#JavaScript', posts: '8.9K', color: 'yellow' },
          ].map((trend, idx) => (
            <div key={idx} className="p-3 hover:bg-gray-50 cursor-pointer transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{trend.tag}</p>
                  <p className="text-xs text-gray-500">{trend.posts} posts</p>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full bg-${trend.color}-100 text-${trend.color}-700`}>
                  ↑ 12%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-100 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-sm">RECENT ACTIVITY</h3>
        </div>
        <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
          {[
            { user: 'Sarah Chen', action: 'liked your post', icon: Heart, color: 'text-red-500' },
            { user: 'Mike Johnson', action: 'commented on your story', icon: MessageCircle, color: 'text-blue-500' },
            { user: 'Alex Rivera', action: 'started following you', icon: Star, color: 'text-yellow-500' },
            { user: 'Emma Wilson', action: 'viewed your profile', icon: Eye, color: 'text-purple-500' },
          ].map((activity, idx) => {
            const Icon = activity.icon;
            return (
              <div key={idx} className="p-3 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className={`${activity.color} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Users */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-100 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-sm">SUGGESTED FOR YOU</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { name: 'Sarah Design', handle: '@sarahdesigns', followers: '5.2K' },
            { name: 'Dev Academy', handle: '@devacademy', followers: '12.3K' },
            { name: 'Tech Weekly', handle: '@techweekly', followers: '8.9K' },
          ].map((user, idx) => (
            <div key={idx} className="p-3 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.handle}</p>
                  <p className="text-xs text-gray-400 mt-1">{user.followers} followers</p>
                </div>
                <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition">
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;

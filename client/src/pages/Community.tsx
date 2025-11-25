import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getCommunityPosts,
  createCommunityPost,
  likeCommunityPost,
  addCommunityComment,
} from '../services/firebaseService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Users, MessageSquare, Send, Heart, Loader2 } from 'lucide-react';
import type { CommunityPost } from '../types';
import { useToast } from '../components/ui/ToastProvider';
import { useProfile } from '../hooks/useProfile';

const Community: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { profile } = useProfile();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedStage, setSelectedStage] = useState<CommunityPost['stage'] | 'all'>('all');
  const [showPostForm, setShowPostForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likeLoadingId, setLikeLoadingId] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [expandedPosts, setExpandedPosts] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedLikes = localStorage.getItem('qw_liked_posts');
    if (storedLikes) {
      try {
        setLikedPosts(JSON.parse(storedLikes));
      } catch {
        setLikedPosts([]);
      }
    }

    let storedDeviceId = localStorage.getItem('qw_device_id');
    if (!storedDeviceId) {
      storedDeviceId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem('qw_device_id', storedDeviceId);
    }
    setDeviceId(storedDeviceId);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('qw_liked_posts', JSON.stringify(likedPosts));
    }
  }, [likedPosts]);

  const loadPosts = useCallback(async () => {
    try {
      const communityPosts = await getCommunityPosts(
        selectedStage === 'all' ? undefined : selectedStage
      );
      setPosts(communityPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      showToast({ title: 'Failed to load community posts', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedStage, showToast]);

  useEffect(() => {
    setLoading(true);
    loadPosts();
  }, [loadPosts]);

  const handleCreatePost = async (content: string, stage: CommunityPost['stage']) => {
    if (!user) {
      showToast({ title: 'Please sign in to post', type: 'info' });
      return;
    }

    try {
      await createCommunityPost(user.uid, {
        content,
        stage,
        authorName: profile?.displayName || `User${user.uid.slice(0, 6)}`,
      });
      await loadPosts();
      setShowPostForm(false);
      showToast({ title: 'Post shared', type: 'success' });
    } catch (error) {
      console.error('Error creating post:', error);
      showToast({ title: 'Failed to create post', type: 'error' });
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      showToast({ title: 'Please sign in to like posts', type: 'info' });
      return;
    }
    if (likedPosts.includes(postId)) {
      showToast({ title: 'Already liked from this device', type: 'info' });
      return;
    }

    try {
      setLikeLoadingId(postId);
      await likeCommunityPost(postId, user.uid, deviceId);
      setLikedPosts((prev) => Array.from(new Set([...prev, postId])));
      await loadPosts();
      showToast({ title: 'Thanks for the encouragement!', type: 'success' });
    } catch (error) {
      const message = (error as Error)?.message;
      if (message === 'already-liked') {
        showToast({ title: 'You already liked this post', type: 'info' });
        setLikedPosts((prev) => Array.from(new Set([...prev, postId])));
      } else {
        console.error('Error liking post:', error);
        showToast({ title: 'Failed to like post', type: 'error' });
      }
    } finally {
      setLikeLoadingId(null);
    }
  };

  const toggleCommentBox = (postId: string) => {
    if (!user) {
      showToast({ title: 'Please sign in to comment', type: 'info' });
      return;
    }
    setActiveCommentId((current) => (current === postId ? null : postId));
  };

  const handleSubmitComment = async (postId: string) => {
    if (!user) {
      showToast({ title: 'Please sign in to comment', type: 'info' });
      return;
    }
    const content = commentDrafts[postId]?.trim();
    if (!content) {
      showToast({ title: 'Comment cannot be empty', type: 'info' });
      return;
    }

    try {
      setCommentLoading(true);
      await addCommunityComment(postId, {
        userId: user.uid,
        authorName: profile?.displayName || `User${user.uid.slice(0, 6)}`,
        content,
      });
      showToast({ title: 'Comment posted', type: 'success' });
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      setActiveCommentId(null);
      await loadPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast({ title: 'Failed to add comment', type: 'error' });
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <header>
        <div className="mb-2 flex items-center space-x-2">
          <Users className="h-6 w-6 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">Community Support</h1>
        </div>
        <p className="text-sm text-gray-500">Connect with others on the same journey</p>
      </header>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {(['all', 'day-0-7', 'day-8-30', 'day-31-plus', 'relapse-restart'] as const).map((stage) => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedStage === stage
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {stage === 'all'
              ? 'All'
              : stage === 'day-0-7'
              ? 'Days 0-7'
              : stage === 'day-8-30'
              ? 'Days 8-30'
              : stage === 'day-31-plus'
              ? '30+ Days'
              : 'Relapse & Restart'}
          </button>
        ))}
      </div>

      {user && (
        <Button fullWidth onClick={() => setShowPostForm(true)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Share Your Story
        </Button>
      )}

      {showPostForm && (
        <PostForm
          onSubmit={handleCreatePost}
          onCancel={() => setShowPostForm(false)}
        />
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="py-8 text-center text-gray-500">
            <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p>No posts yet. Be the first to share!</p>
          </Card>
        ) : (
          posts.map((post) => {
            const hasLiked =
              post.likedBy?.includes(user?.uid || '') || likedPosts.includes(post.id);
            return (
              <PostCard
                key={post.id}
                post={post}
                hasLiked={hasLiked}
                likeDisabled={hasLiked || likeLoadingId === post.id}
                onLike={() => handleLikePost(post.id)}
                onCommentToggle={() => toggleCommentBox(post.id)}
                isCommenting={activeCommentId === post.id}
                commentValue={commentDrafts[post.id] || ''}
                onCommentChange={(value) =>
                  setCommentDrafts((prev) => ({ ...prev, [post.id]: value }))
                }
                onSubmitComment={() => handleSubmitComment(post.id)}
                commentSubmitting={commentLoading}
                showAllComments={expandedPosts.includes(post.id)}
                onToggleFullComments={() =>
                  setExpandedPosts((prev) =>
                    prev.includes(post.id)
                      ? prev.filter((id) => id !== post.id)
                      : [...prev, post.id]
                  )
                }
              />
            );
          })
        )}
      </div>

      {!user && (
        <Card className="border-blue-100 bg-blue-50">
          <p className="text-sm text-blue-700">Sign in to participate in the community</p>
        </Card>
      )}
    </div>
  );
};

const PostForm: React.FC<{
  onSubmit: (content: string, stage: CommunityPost['stage']) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState('');
  const [stage, setStage] = useState<CommunityPost['stage']>('day-0-7');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content, stage);
      setContent('');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="community-stage" className="mb-2 block text-sm font-medium text-gray-700">
            Your Stage
          </label>
          <select
            id="community-stage"
            value={stage}
            onChange={(e) => setStage(e.target.value as CommunityPost['stage'])}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="day-0-7">Days 0-7</option>
            <option value="day-8-30">Days 8-30</option>
            <option value="day-31-plus">30+ Days</option>
            <option value="relapse-restart">Relapse & Restart</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Share your story, ask for support, or encourage others
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
            rows={4}
            placeholder="What's on your mind?"
            required
          />
        </div>

        <div className="flex space-x-3">
          <Button type="button" variant="outline" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            <Send className="mr-2 h-4 w-4" />
            Post
          </Button>
        </div>
      </form>
    </Card>
  );
};

const PostCard: React.FC<{
  post: CommunityPost;
  hasLiked: boolean;
  likeDisabled?: boolean;
  onLike: () => void;
  onCommentToggle: () => void;
  isCommenting: boolean;
  commentValue: string;
  onCommentChange: (value: string) => void;
  onSubmitComment: () => void;
  commentSubmitting: boolean;
  showAllComments: boolean;
  onToggleFullComments: () => void;
}> = ({
  post,
  hasLiked,
  likeDisabled,
  onLike,
  onCommentToggle,
  isCommenting,
  commentValue,
  onCommentChange,
  onSubmitComment,
  commentSubmitting,
  showAllComments,
  onToggleFullComments,
}) => {
  const date = new Date(post.createdAt);
  const timeAgo = getTimeAgo(date);

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-900">{post.authorName}</p>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
          <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
            {post.stage === 'day-0-7'
              ? 'Days 0-7'
              : post.stage === 'day-8-30'
              ? 'Days 8-30'
              : post.stage === 'day-31-plus'
              ? '30+ Days'
              : 'Relapse & Restart'}
          </span>
        </div>

        <p className="whitespace-pre-line text-gray-700">{post.content}</p>

        <div className="flex items-center space-x-4 border-t pt-2">
          <button
            onClick={onLike}
            disabled={likeDisabled}
            className={`flex items-center space-x-1 text-sm transition-colors ${
              hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            } ${likeDisabled ? 'opacity-60' : ''}`}
          >
            <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current text-red-500' : ''}`} />
            <span>{post.likes || 0}</span>
          </button>
          <button
            onClick={onCommentToggle}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>

        {isCommenting && (
          <div className="space-y-2 border-t pt-3">
            <textarea
              value={commentValue}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Share some encouragement..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-50"
              rows={3}
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={onSubmitComment}
                disabled={commentSubmitting}
              >
                {commentSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post comment'}
              </Button>
              <Button size="sm" variant="ghost" onClick={onCommentToggle}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {post.comments && post.comments.length > 0 && (
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="space-y-2">
              {(showAllComments ? post.comments : post.comments.slice(-3)).map((comment) => (
                <div key={comment.id} className="text-sm">
                  <span className="font-semibold text-gray-800">{comment.authorName}:</span>{' '}
                  <span className="text-gray-700">{comment.content}</span>
                </div>
              ))}
              {post.comments.length > 3 && (
                <button
                  type="button"
                  onClick={onToggleFullComments}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  {showAllComments
                    ? 'Hide extra comments'
                    : `View ${post.comments.length - 3} more comments`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default Community;

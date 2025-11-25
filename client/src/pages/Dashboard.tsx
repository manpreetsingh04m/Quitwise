import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { getUserProfile, createLogEntry, updateUserProfile } from '../services/firebaseService';
import { useToast } from '../components/ui/ToastProvider';
import { calculateStreak } from '../utils/time';
import type { UserProfile } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Coins, Flame, ShieldCheck, PlusCircle, AlertCircle, BookOpen, Users, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile: contextProfile, refreshProfile } = useProfile();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState({ hours: 0, days: 0 });
  const [showConfirmLogUse, setShowConfirmLogUse] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
      await refreshProfile();
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [refreshProfile, user]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  useEffect(() => {
    if (profile) {
      const streakData = calculateStreak(profile.streakData?.lastUseTimestamp || null);
      setStreak(streakData);

      // Update streak every minute
      const interval = setInterval(() => {
        const updatedStreak = calculateStreak(profile.streakData?.lastUseTimestamp || null);
        setStreak(updatedStreak);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [profile]);

  const handleLogUseClick = () => {
    if (!user) return;
    setShowConfirmLogUse(true);
  };

  const confirmLogUse = async () => {
    if (!user) return;
    setShowConfirmLogUse(false);

    try {
      // Create log entry
      await createLogEntry(user.uid, {
        type: 'use',
      });

      // Update profile with new last use timestamp
      const now = Date.now();
      await updateUserProfile(user.uid, {
        streakData: {
          lastUseTimestamp: now,
          longestStreak: profile?.streakData?.longestStreak || 0,
          currentStreak: 0,
          streakHours: 0,
        },
      });

      await loadProfile();
      navigate('/log');
      showToast({
        title: 'Use logged',
        description: 'Your streak has been reset.',
        type: 'info',
      });
    } catch (error) {
      console.error('Error logging use:', error);
      showToast({ title: 'Failed to log use', type: 'error' });
    }
  };

  const handleResistCraving = async () => {
    if (!user) return;

    try {
      // Create log entry
      await createLogEntry(user.uid, {
        type: 'resisted',
      });

      // Award token
      const newTokens = (profile?.tokens || 0) + 1;
      await updateUserProfile(user.uid, {
        tokens: newTokens,
      });

      await loadProfile();
      showToast({
        title: 'Great job!',
        description: 'You earned 1 token for resisting.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error logging resistance:', error);
      showToast({ title: 'Failed to log resistance', type: 'error' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const assessment = profile?.assessment;
  const tokens = profile?.tokens || 0;

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            Hi, {contextProfile?.displayName?.split(' ')[0] || 'there'}
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
          <Coins className="w-4 h-4 text-yellow-600" />
          <span className="font-bold text-yellow-700">{tokens}</span>
        </div>
      </header>

      {!assessment && (
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">Complete your assessment</h3>
              <p className="text-sm text-blue-700">Get a personalized plan by answering a few questions about your habits.</p>
              <Link to="/assessment">
                <Button size="sm" className="mt-2">Start Assessment</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-linear-to-br from-orange-50 to-red-50 border-orange-100 flex flex-col items-center justify-center text-center py-6">
          <div className="bg-white p-3 rounded-full shadow-sm mb-3">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <span className="text-3xl font-bold text-gray-900">{streak.days}d {streak.hours}h</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Clean Streak</span>
        </Card>

        <Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-100 flex flex-col items-center justify-center text-center py-6">
          <div className="bg-white p-3 rounded-full shadow-sm mb-3">
            <ShieldCheck className="w-6 h-6 text-green-500" />
          </div>
          <span className="text-3xl font-bold text-gray-900">{assessment?.level || '-'}</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Dependence</span>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        
        <Button 
          fullWidth 
          variant="outline" 
          className="justify-between group hover:border-red-200 hover:bg-red-50"
          onClick={handleLogUseClick}
        >
          <span className="group-hover:text-red-700">I just vaped/smoked</span>
          <PlusCircle className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
        </Button>

        <Button 
          fullWidth 
          variant="outline" 
          className="justify-between group hover:border-green-200 hover:bg-green-50"
          onClick={handleResistCraving}
        >
          <span className="group-hover:text-green-700">I resisted a craving</span>
          <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
        </Button>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/log">
          <Card className="bg-blue-50 border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <PlusCircle className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Log Entry</h3>
                <p className="text-xs text-blue-700">Track your progress</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/economic">
          <Card className="bg-green-50 border-green-100 hover:bg-green-100 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Savings</h3>
                <p className="text-xs text-green-700">View your savings</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/cbt">
          <Card className="bg-purple-50 border-purple-100 hover:bg-purple-100 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-900">CBT Library</h3>
                <p className="text-xs text-purple-700">Learn & practice</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/community">
          <Card className="bg-orange-50 border-orange-100 hover:bg-orange-100 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-900">Community</h3>
                <p className="text-xs text-orange-700">Get support</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <Card className="bg-gray-900 text-white overflow-hidden relative">
        <div className="relative z-10 space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Rewards Shop</h3>
            <p className="text-gray-400 text-sm">Spend your hard-earned tokens.</p>
          </div>
          <Link to="/tokens" className="block">
            <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 border-0">
              Open Rewards
            </Button>
          </Link>
        </div>
        <div className="absolute right-0 top-0 w-32 h-32 bg-gray-800 rounded-full -mr-10 -mt-10 opacity-50" />
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-gray-800 rounded-full -mr-5 -mb-5 opacity-50" />
      </Card>

      {showConfirmLogUse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <Card className="w-full max-w-sm space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Log Use</h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to log a use? This will reset your current streak.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirmLogUse(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={confirmLogUse}
              >
                Confirm
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

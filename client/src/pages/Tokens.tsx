import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { updateUserProfile } from '../services/firebaseService';
import { calculateStreak } from '../utils/time';
import type { Reward } from '../types';
import { rewards } from '../data/rewardsConfig';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Coins, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

const Tokens: React.FC = () => {
  const { user } = useAuth();
  const { profile, refreshProfile, loading: profileLoading } = useProfile();
  const [pendingReward, setPendingReward] = useState<Reward | null>(null);
  const { showToast } = useToast();

  const streak = useMemo(() => {
    if (!profile) return { hours: 0, days: 0 };
    const lastUseTimestamp = profile.streakData?.lastUseTimestamp || null;
    return calculateStreak(lastUseTimestamp);
  }, [profile]);

  const loading = profileLoading;

  const handleSyncTokens = async () => {
    if (!user || !profile) return;

    const lastUseTimestamp = profile.streakData?.lastUseTimestamp || null;
    const { hours } = calculateStreak(lastUseTimestamp);
    const storedStreakHours = profile.streakData?.streakHours || 0;
    const diff = hours - storedStreakHours;

    if (diff > 0) {
      try {
        const newTokens = (profile.tokens || 0) + diff;
        await updateUserProfile(user.uid, {
          tokens: newTokens,
          streakData: {
            currentStreak: profile.streakData?.currentStreak || 0,
            longestStreak: profile.streakData?.longestStreak || 0,
            lastUseTimestamp: profile.streakData?.lastUseTimestamp || null,
            streakHours: hours,
          },
        });
        await refreshProfile();
        showToast({
          title: 'Tokens synced',
          description: `You earned ${diff} token${diff > 1 ? 's' : ''}.`,
          type: 'success',
        });
      } catch (error) {
        console.error('Error syncing tokens:', error);
        showToast({ title: 'Failed to sync tokens', type: 'error' });
      }
    } else {
      showToast({
        title: 'All caught up',
        description: 'No new tokens to sync yet. Keep going!',
        type: 'info',
      });
    }
  };

  const handleSpendTokens = (reward: Reward) => {
    if (!profile) return;
    const currentTokens = profile.tokens || 0;
    if (currentTokens < reward.cost) {
      showToast({
        title: 'Not enough tokens',
        description: `You need ${reward.cost} tokens to redeem ${reward.label}.`,
        type: 'error',
      });
      return;
    }
    setPendingReward(reward);
  };

  const confirmRedeem = async () => {
    if (!pendingReward || !user || !profile) return;
    
    try {
      const newTokens = (profile.tokens || 0) - pendingReward.cost;
      await updateUserProfile(user.uid, {
        tokens: newTokens,
      });
      await refreshProfile();
      showToast({
        title: 'Reward unlocked',
        description: `Enjoy "${pendingReward.label}"`,
        type: 'success',
      });
      setPendingReward(null);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      showToast({ title: 'Failed to redeem reward', type: 'error' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const currentTokens = profile?.tokens || 0;

  return (
    <>
      <div className="space-y-6 pb-20">
      <header className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Token Economy</h1>
        
        <Card className="bg-yellow-50 border-yellow-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-yellow-700 font-medium">Current Balance</p>
            <div className="flex items-center space-x-2">
              <Coins className="w-6 h-6 text-yellow-600" />
              <span className="text-3xl font-bold text-gray-900">{currentTokens}</span>
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={handleSyncTokens} className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync
          </Button>
        </Card>

        <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
          <Clock className="w-4 h-4" />
          <span>Time since last use: <strong>{streak.days}d {streak.hours}h</strong></span>
        </div>
      </header>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Rewards</h2>
        <div className="grid gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{reward.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{reward.label}</h3>
                  <p className="text-sm text-gray-500">{reward.cost} tokens</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={currentTokens >= reward.cost ? 'primary' : 'ghost'}
                disabled={currentTokens < reward.cost}
                onClick={() => handleSpendTokens(reward)}
              >
                Redeem
              </Button>
            </Card>
          ))}
        </div>
      </div>
      </div>

      {pendingReward && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
          <Card className="w-full max-w-sm space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">Redeem reward?</h3>
              <p className="text-sm text-gray-600">
                Spend {pendingReward.cost} tokens to unlock "{pendingReward.label}"?
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={() => setPendingReward(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={confirmRedeem}>
                Redeem
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default Tokens;


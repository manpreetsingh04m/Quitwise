import React, { useEffect, useState } from 'react';
import { getTokenData, saveTokenData } from '../utils/storage';
import { calculateStreak } from '../utils/time';
import type { TokenData } from '../types';
import { rewards } from '../data/rewardsConfig';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Coins, Clock, RefreshCw } from 'lucide-react';

const Tokens: React.FC = () => {
  const [tokenData, setTokenData] = useState<TokenData>({ lastUseTimestamp: null, tokens: 0, streakHours: 0 });
  const [streak, setStreak] = useState({ hours: 0, days: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedTokens = getTokenData();
    setTokenData(loadedTokens);
    setStreak(calculateStreak(loadedTokens.lastUseTimestamp));
  };

  const handleSyncTokens = () => {
    // In this simple model, we'll just add 1 token for every hour of streak that hasn't been accounted for?
    // Or simpler: just calculate tokens based on streak and ADD to current.
    // But we need to track "lastSyncTime" to avoid double counting.
    // For this MVP, let's just add 1 token manually for demo or use the "Resist craving" button.
    // The prompt says: "Convert that to tokens using a simple formula".
    
    // Let's implement a simple "Claim Tokens" feature based on streak.
    // We'll just give 1 token per hour.
    // To prevent abuse in this stateless MVP without backend, we'll just show the potential tokens.
    
    const { hours } = calculateStreak(tokenData.lastUseTimestamp);
    // This is a bit tricky without a backend or more complex state to track "claimed" hours.
    // Let's just make the "Sync" button add 5 tokens for demo purposes or recalculate based on total time if we assume tokens = hours clean (minus spent).
    
    // Let's go with: User clicks "Sync", we check hours since last use.
    // If hours > tokenData.streakHours (stored), we add the difference.
    
    const newStreakHours = hours;
    const diff = newStreakHours - (tokenData.streakHours || 0);
    
    if (diff > 0) {
      const newData = {
        ...tokenData,
        tokens: tokenData.tokens + diff,
        streakHours: newStreakHours,
      };
      saveTokenData(newData);
      setTokenData(newData);
      alert(`Synced! You earned ${diff} tokens for ${diff} hours clean.`);
    } else {
      alert("No new tokens to sync yet. Keep going!");
    }
  };

  const handleSpendTokens = (cost: number, rewardName: string) => {
    if (tokenData.tokens >= cost) {
      if (confirm(`Spend ${cost} tokens on "${rewardName}"?`)) {
        const newData = {
          ...tokenData,
          tokens: tokenData.tokens - cost,
        };
        saveTokenData(newData);
        setTokenData(newData);
      }
    } else {
      alert("Not enough tokens!");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Token Economy</h1>
        
        <Card className="bg-yellow-50 border-yellow-100 flex justify-between items-center">
          <div>
            <p className="text-sm text-yellow-700 font-medium">Current Balance</p>
            <div className="flex items-center space-x-2">
              <Coins className="w-6 h-6 text-yellow-600" />
              <span className="text-3xl font-bold text-gray-900">{tokenData.tokens}</span>
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
                variant={tokenData.tokens >= reward.cost ? 'primary' : 'ghost'}
                disabled={tokenData.tokens < reward.cost}
                onClick={() => handleSpendTokens(reward.cost, reward.label)}
              >
                Redeem
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tokens;

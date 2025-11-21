import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssessment, getTokenData, saveTokenData } from '../utils/storage';
import { calculateStreak } from '../utils/time';
import type { AssessmentResult, TokenData } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Coins, Flame, ShieldCheck, PlusCircle, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [tokenData, setTokenData] = useState<TokenData>({ lastUseTimestamp: null, tokens: 0, streakHours: 0 });
  const [streak, setStreak] = useState({ hours: 0, days: 0 });

  useEffect(() => {
    const loadedAssessment = getAssessment();
    const loadedTokens = getTokenData();
    setAssessment(loadedAssessment);
    setTokenData(loadedTokens);
    setStreak(calculateStreak(loadedTokens.lastUseTimestamp));

    // Update streak every minute
    const interval = setInterval(() => {
      setStreak(calculateStreak(loadedTokens.lastUseTimestamp));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleLogUse = () => {
    if (confirm("Are you sure you want to log a use? This will reset your current streak.")) {
      const newData = {
        ...tokenData,
        lastUseTimestamp: Date.now(),
        streakHours: 0, // Reset streak
      };
      saveTokenData(newData);
      setTokenData(newData);
      setStreak({ hours: 0, days: 0 });
    }
  };

  const handleResistCraving = () => {
    const newData = {
      ...tokenData,
      tokens: tokenData.tokens + 1,
    };
    saveTokenData(newData);
    setTokenData(newData);
    alert("Great job! You earned 1 token for resisting.");
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
          <Coins className="w-4 h-4 text-yellow-600" />
          <span className="font-bold text-yellow-700">{tokenData.tokens}</span>
        </div>
      </header>

      {!assessment && (
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
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
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-100 flex flex-col items-center justify-center text-center py-6">
          <div className="bg-white p-3 rounded-full shadow-sm mb-3">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <span className="text-3xl font-bold text-gray-900">{streak.days}d {streak.hours}h</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Clean Streak</span>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 flex flex-col items-center justify-center text-center py-6">
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
          onClick={handleLogUse}
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
    </div>
  );
};

export default Dashboard;

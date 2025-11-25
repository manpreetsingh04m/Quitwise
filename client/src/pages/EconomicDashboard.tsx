import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../services/firebaseService';
import { getUserAnalytics } from '../services/analyticsService';
import Card from '../components/ui/Card';
import { DollarSign, TrendingUp, Target, Calendar, PiggyBank } from 'lucide-react';
import type { UserProfile, SavingsData, FinancialGoal } from '../types';

const EconomicDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [userProfile, userAnalytics] = await Promise.all([
        getUserProfile(user.uid),
        getUserAnalytics(user.uid),
      ]);
      setProfile(userProfile);
      setAnalytics(userAnalytics);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!profile?.assessment?.economicProfile) {
    return (
      <Card className="text-center py-8">
        <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600">Complete your assessment to see your economic dashboard</p>
      </Card>
    );
  }

  const savings = analytics?.savingsData || {
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    sixMonths: 0,
    oneYear: 0,
    totalSinceQuit: 0,
    daysSinceQuit: 0,
  };

  const financialGoals = profile.assessment.economicProfile.financialGoals || [];

  return (
    <div className="space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Money & Health</h1>
        <p className="text-sm text-gray-500 mt-1">Track your savings and financial progress</p>
      </header>

      {/* Real-time Savings */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PiggyBank className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold text-green-900">Total Saved</h2>
          </div>
          <span className="text-2xl font-bold text-green-700">
            ₹{savings.totalSinceQuit.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-green-700">
          {savings.daysSinceQuit} days since your quit date
        </p>
      </Card>

      {/* Savings Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <div className="text-center">
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Today</p>
            <p className="text-xl font-bold text-blue-900">₹{savings.today.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="bg-purple-50 border-purple-100">
          <div className="text-center">
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-1">This Week</p>
            <p className="text-xl font-bold text-purple-900">₹{savings.thisWeek.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="bg-orange-50 border-orange-100">
          <div className="text-center">
            <p className="text-xs font-medium text-orange-600 uppercase tracking-wider mb-1">This Month</p>
            <p className="text-xl font-bold text-orange-900">₹{savings.thisMonth.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="bg-indigo-50 border-indigo-100">
          <div className="text-center">
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1">6 Months</p>
            <p className="text-xl font-bold text-indigo-900">₹{savings.sixMonths.toFixed(2)}</p>
          </div>
        </Card>
      </div>

      {/* Long-term Projections */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Long-term Projections</h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">1 Year Savings</span>
            <span className="text-lg font-bold text-gray-900">₹{savings.oneYear.toFixed(2)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${Math.min((savings.totalSinceQuit / savings.oneYear) * 100, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Financial Goals */}
      {financialGoals.length > 0 && (
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Your Financial Goals</h2>
          </div>
          <div className="space-y-4">
            {financialGoals.map((goal) => (
              <FinancialGoalCard key={goal.id} goal={goal} totalSaved={savings.totalSinceQuit} />
            ))}
          </div>
        </Card>
      )}

      {/* Comparisons */}
      <Card className="bg-gray-900 text-white">
        <h2 className="text-lg font-semibold mb-4">What Your Savings Equal</h2>
        <div className="space-y-3">
          <ComparisonItem
            label="Movie Tickets"
            value={Math.floor(savings.thisMonth / 200)}
            unit="tickets"
          />
          <ComparisonItem
            label="Café Outings"
            value={Math.floor(savings.thisMonth / 300)}
            unit="outings"
          />
          <ComparisonItem
            label="Meals Out"
            value={Math.floor(savings.thisMonth / 500)}
            unit="meals"
          />
        </div>
      </Card>

      {/* Behavioral Nudges */}
      <Card className="bg-yellow-50 border-yellow-100">
        <p className="text-sm text-yellow-800 italic">
          "You are paying a premium to feel worse later. Is that really a good investment?"
        </p>
      </Card>

      <Card className="bg-blue-50 border-blue-100">
        <p className="text-sm text-blue-800 italic">
          "Nicotine: the subscription you never needed but keep renewing. Cancel?"
        </p>
      </Card>
    </div>
  );
};

const FinancialGoalCard: React.FC<{ goal: FinancialGoal; totalSaved: number }> = ({
  goal,
  totalSaved,
}) => {
  const progress = Math.min((totalSaved / goal.targetAmount) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-900">{goal.name}</span>
        <span className="text-sm text-gray-600">
          ₹{totalSaved.toFixed(2)} / ₹{goal.targetAmount.toFixed(2)}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">
        {progress.toFixed(0)}% of the way to your goal
      </p>
    </div>
  );
};

const ComparisonItem: React.FC<{ label: string; value: number; unit: string }> = ({
  label,
  value,
  unit,
}) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-300">{label}</span>
      <span className="font-bold text-white">
        {value} {unit}
      </span>
    </div>
  );
};

export default EconomicDashboard;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentQuestions, getDependenceLevel } from '../data/assessmentConfig';
import { saveAssessment } from '../services/firebaseService';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { CheckCircle2, Brain, DollarSign, Target } from 'lucide-react';
import type { PsychologicalProfile, EconomicProfile, QuitGoal, RiskProfile, AssessmentResult } from '../types';

type AssessmentStep = 'welcome' | 'psychological' | 'economic' | 'quit-goal' | 'complete';

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [step, setStep] = useState<AssessmentStep>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [psychologicalProfile, setPsychologicalProfile] = useState<Partial<PsychologicalProfile>>({});
  const [economicProfile, setEconomicProfile] = useState<Partial<EconomicProfile>>({});
  const [quitGoal, setQuitGoal] = useState<Partial<QuitGoal>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [level, setLevel] = useState<"low" | "moderate" | "high">("low");

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / assessmentQuestions.length) * 100;

  const handleAnswer = (scoreValue: number) => {
    const newAnswers = { ...answers, [currentQuestion.id]: scoreValue };
    setAnswers(newAnswers);

    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishBasicAssessment(newAnswers);
    }
  };

  const finishBasicAssessment = (finalAnswers: Record<number, number>) => {
    const totalScore = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
    const resultLevel = getDependenceLevel(totalScore);
    setLevel(resultLevel);
    setStep('psychological');
  };

  const handlePsychologicalSubmit = (profile: Partial<PsychologicalProfile>) => {
    setPsychologicalProfile(profile);
    setStep('economic');
  };

  const handleEconomicSubmit = (profile: Partial<EconomicProfile>) => {
    setEconomicProfile(profile);
    setStep('quit-goal');
  };

  const handleQuitGoalSubmit = async (goal: Partial<QuitGoal>) => {
    setQuitGoal(goal);
    
    // Calculate risk profile
    const riskProfile: RiskProfile = {
      highRiskTimes: psychologicalProfile.triggers?.includes('stress') ? [10, 11, 18, 19] : [],
      mainTriggers: (psychologicalProfile.triggers as any) || [],
      riskLevel: level,
    };

    // Calculate savings projection
    const dailyCost = (psychologicalProfile.frequency || 0) * (economicProfile.costPerUnit || 0);
    const monthlySavings = dailyCost * 30;

    const assessmentResult: AssessmentResult = {
      score: Object.values(answers).reduce((a, b) => a + b, 0),
      level,
      completedAt: new Date().toISOString(),
      psychologicalProfile: psychologicalProfile as PsychologicalProfile,
      economicProfile: economicProfile as EconomicProfile,
      quitGoal: quitGoal as QuitGoal,
      riskProfile,
    };

    if (user) {
      await saveAssessment(user.uid, assessmentResult);
    }

    setIsCompleted(true);
  };

  if (isCompleted) {
    const dailyCost = (psychologicalProfile.frequency || 0) * (economicProfile.costPerUnit || 0);
    const monthlySavings = dailyCost * 30;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckCircle2 className="text-green-600 w-12 h-12" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Assessment Complete</h2>
          <p className="text-gray-500">Your personalized plan is ready</p>
        </div>

        <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="text-center space-y-4">
            <div>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Dependence Level</p>
              <h3 className="text-3xl font-bold text-blue-900 mt-1 capitalize">{level}</h3>
            </div>
            <p className="text-blue-800 text-sm leading-relaxed">
              {level === 'low' && "You have a low level of dependence. This is a great time to quit before it becomes harder."}
              {level === 'moderate' && "You have a moderate level of dependence. Quitting now will require some effort but is very achievable."}
              {level === 'high' && "You have a high level of dependence. It might be challenging, but with the right support and tools, you can do it."}
            </p>
          </div>
        </Card>

        {monthlySavings > 0 && (
          <Card className="w-full bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
            <div className="text-center space-y-2">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto" />
              <p className="text-sm font-medium text-green-600 uppercase tracking-wider">Potential Monthly Savings</p>
              <h3 className="text-2xl font-bold text-green-900">₹{monthlySavings.toFixed(2)}</h3>
              <p className="text-green-700 text-sm">If you follow this plan, you will save this amount per month</p>
            </div>
          </Card>
        )}

        <Button fullWidth size="lg" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (profileLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  if (!profile?.displayName) {
    return (
      <Card className="max-w-md mx-auto mt-10 space-y-3 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Add your name to continue</h2>
        <p className="text-sm text-gray-600">
          Please save your name first so we can personalize your plan and community presence.
        </p>
        <p className="text-xs text-gray-500">
          Use the name prompt at the top of the app to tell us who you are.
        </p>
      </Card>
    );
  }

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <div className="max-w-md mx-auto py-4 space-y-6">
        <Card className="text-center space-y-4 py-8">
          <div className="bg-blue-50 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <Brain className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to QuitWise</h2>
          <p className="text-gray-600 leading-relaxed">
            We will help you quit by understanding your habits, mind, and money.
          </p>
          <p className="text-sm text-gray-500">
            This assessment will take about 5-10 minutes and will help us create a personalized plan for you.
          </p>
          <Button fullWidth size="lg" onClick={() => setStep('psychological')}>
            Get Started
          </Button>
        </Card>
      </div>
    );
  }

  // Psychological Profile Screen
  if (step === 'psychological') {
    return (
      <PsychologicalProfileForm
        onSubmit={handlePsychologicalSubmit}
        initialData={psychologicalProfile}
      />
    );
  }

  // Economic Profile Screen
  if (step === 'economic') {
    return (
      <EconomicProfileForm
        onSubmit={handleEconomicSubmit}
        initialData={economicProfile}
      />
    );
  }

  // Quit Goal Screen
  if (step === 'quit-goal') {
    return (
      <QuitGoalForm
        onSubmit={handleQuitGoalSubmit}
        initialData={quitGoal}
        psychologicalProfile={psychologicalProfile as PsychologicalProfile}
      />
    );
  }

  // Basic Assessment Questions
  return (
    <div className="max-w-md mx-auto py-4 space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
          <span>Question {currentQuestionIndex + 1} of {assessmentQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / assessmentQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="min-h-[300px] flex flex-col justify-center space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 leading-tight">
          {currentQuestion.text}
        </h2>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option.score)}
              className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            >
              <span className="font-medium text-gray-700 group-hover:text-blue-700">
                {option.text}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Psychological Profile Form Component
const PsychologicalProfileForm: React.FC<{
  onSubmit: (profile: Partial<PsychologicalProfile>) => void;
  initialData: Partial<PsychologicalProfile>;
}> = ({ onSubmit, initialData }) => {
  const [frequency, setFrequency] = useState(initialData.frequency || 0);
  const [triggers, setTriggers] = useState<string[]>(initialData.triggers || []);
  const [motivation, setMotivation] = useState(initialData.motivationRating || 5);
  const [confidence, setConfidence] = useState(initialData.confidenceRating || 5);
  const [anxiety, setAnxiety] = useState(initialData.moodBaseline?.anxiety || 5);
  const [depression, setDepression] = useState(initialData.moodBaseline?.depression || 5);
  const [stress, setStress] = useState(initialData.moodBaseline?.stress || 5);

  const triggerOptions = [
    { value: 'stress', label: 'Stress' },
    { value: 'social', label: 'Social Pressure' },
    { value: 'boredom', label: 'Boredom' },
    { value: 'habit', label: 'Habit/Routine' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      frequency,
      triggers: triggers as any,
      motivationRating: motivation,
      confidenceRating: confidence,
      moodBaseline: { anxiety, depression, stress },
    });
  };

  return (
    <div className="max-w-md mx-auto py-4 space-y-6">
      <Card>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Psychological Profile</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many times per day do you vape/smoke?
              </label>
              <input
                type="number"
                min="0"
                value={frequency}
                onChange={(e) => setFrequency(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What triggers your use? (Select all that apply)
              </label>
              <div className="space-y-2">
                {triggerOptions.map(option => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={triggers.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTriggers([...triggers, option.value]);
                        } else {
                          setTriggers(triggers.filter(t => t !== option.value));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How important is quitting to you? (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={motivation}
                onChange={(e) => setMotivation(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Not Important</span>
                <span className="font-bold text-blue-600">{motivation}</span>
                <span>Very Important</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How confident are you that you can quit? (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Not Confident</span>
                <span className="font-bold text-blue-600">{confidence}</span>
                <span>Very Confident</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">Mood Baseline (1-10)</p>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Anxiety</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={anxiety}
                  onChange={(e) => setAnxiety(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Depression</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={depression}
                  onChange={(e) => setDepression(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Stress</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stress}
                  onChange={(e) => setStress(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <Button type="submit" fullWidth size="lg">
              Continue
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

// Economic Profile Form Component
const EconomicProfileForm: React.FC<{
  onSubmit: (profile: Partial<EconomicProfile>) => void;
  initialData: Partial<EconomicProfile>;
}> = ({ onSubmit, initialData }) => {
  const [costPerUnit, setCostPerUnit] = useState(initialData.costPerUnit || 0);
  const [goals, setGoals] = useState<Array<{ name: string; targetAmount: number }>>(
    initialData.financialGoals?.map(g => ({ name: g.name, targetAmount: g.targetAmount })) || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dailySpending = costPerUnit * 10; // Estimate based on average usage
    const weeklySpending = dailySpending * 7;
    
    onSubmit({
      costPerUnit,
      dailySpending,
      weeklySpending,
      financialGoals: goals.map((g, i) => ({
        id: `goal-${i}`,
        name: g.name,
        targetAmount: g.targetAmount,
        currentProgress: 0,
      })),
    });
  };

  const addGoal = () => {
    setGoals([...goals, { name: '', targetAmount: 0 }]);
  };

  return (
    <div className="max-w-md mx-auto py-4 space-y-6">
      <Card>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Economic Profile</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost per cigarette/pod (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Goals (What will you do with the money you save?)
              </label>
              <div className="space-y-3">
                {goals.map((goal, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g., New phone, Travel"
                      value={goal.name}
                      onChange={(e) => {
                        const newGoals = [...goals];
                        newGoals[index].name = e.target.value;
                        setGoals(newGoals);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={goal.targetAmount || ''}
                      onChange={(e) => {
                        const newGoals = [...goals];
                        newGoals[index].targetAmount = parseFloat(e.target.value) || 0;
                        setGoals(newGoals);
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addGoal}>
                  + Add Goal
                </Button>
              </div>
            </div>

            <Button type="submit" fullWidth size="lg">
              Continue
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

// Quit Goal Form Component
const QuitGoalForm: React.FC<{
  onSubmit: (goal: Partial<QuitGoal>) => void;
  initialData: Partial<QuitGoal>;
  psychologicalProfile: Partial<PsychologicalProfile>;
}> = ({ onSubmit, initialData, psychologicalProfile }) => {
  const [strategy, setStrategy] = useState<QuitGoal['strategy']>(initialData.strategy || 'gradual');
  const [quitDate, setQuitDate] = useState(initialData.quitDate || '');
  const [maxPerDay, setMaxPerDay] = useState(initialData.maxPerDay || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      strategy,
      quitDate,
      maxPerDay: strategy === 'tapering' ? maxPerDay : undefined,
    });
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-md mx-auto py-4 space-y-6">
      <Card>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Set Your Quit Goal</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quit Strategy
              </label>
              <div className="space-y-2">
                {(['gradual', 'cold-turkey', 'tapering'] as const).map((opt) => (
                  <label key={opt} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="strategy"
                      value={opt}
                      checked={strategy === opt}
                      onChange={() => setStrategy(opt)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {opt === 'cold-turkey' ? 'Cold Turkey (Stop Immediately)' : 
                       opt === 'gradual' ? 'Gradual Reduction' : 
                       'Tapering (Reduce Gradually)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quit Date
              </label>
              <input
                type="date"
                min={minDate}
                value={quitDate}
                onChange={(e) => setQuitDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {strategy === 'tapering' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum per day during tapering
                </label>
                <input
                  type="number"
                  min="1"
                  max={psychologicalProfile.frequency || 20}
                  value={maxPerDay}
                  onChange={(e) => setMaxPerDay(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            <Button type="submit" fullWidth size="lg">
              Complete Assessment
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Assessment;

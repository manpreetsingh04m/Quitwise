import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, DollarSign, Target, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center">
      <div className="bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-full">
        <Brain className="text-blue-600 w-16 h-16" />
      </div>
      
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          QuitWise
        </h1>
        <p className="text-gray-600 max-w-sm mx-auto leading-relaxed text-lg">
          Quit smoking and vaping by combining psychology and behavioral economics
        </p>
        <p className="text-gray-500 max-w-xs mx-auto leading-relaxed text-sm">
          We help you understand your habits, mind, and money to create lasting change.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="w-full space-y-3">
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-start space-x-3">
            <Brain className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
            <div className="text-left">
              <h3 className="font-semibold text-blue-900 text-sm">Psychological Support</h3>
              <p className="text-xs text-blue-700">CBT techniques, habit loops, and self-regulation tools</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <div className="flex items-start space-x-3">
            <DollarSign className="w-5 h-5 text-green-600 shrink-0 mt-1" />
            <div className="text-left">
              <h3 className="font-semibold text-green-900 text-sm">Economic Insights</h3>
              <p className="text-xs text-green-700">Track savings, set financial goals, and see the real cost</p>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 border-purple-100">
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-purple-600 shrink-0 mt-1" />
            <div className="text-left">
              <h3 className="font-semibold text-purple-900 text-sm">Personalized Plan</h3>
              <p className="text-xs text-purple-700">Just-in-time interventions based on your patterns</p>
            </div>
          </div>
        </Card>

        <Card className="bg-orange-50 border-orange-100">
          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 text-orange-600 shrink-0 mt-1" />
            <div className="text-left">
              <h3 className="font-semibold text-orange-900 text-sm">Community Support</h3>
              <p className="text-xs text-orange-700">Connect with others on the same journey</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="w-full space-y-3">
        <Link to="/assessment" className="block">
          <Button fullWidth size="lg" className="group">
            Start Assessment
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        
        <Link to="/dashboard" className="block">
          <Button variant="ghost" fullWidth>
            Open Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 text-center">
      <div className="bg-blue-50 p-4 rounded-full">
        <Activity className="text-blue-600 w-12 h-12" />
      </div>
      
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Take Control of Your Habits
        </h1>
        <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
          A supportive companion to help you understand and change your vaping or smoking habits.
        </p>
      </div>

      <Card className="w-full bg-blue-50 border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2">Not a Medical Tool</h3>
        <p className="text-sm text-blue-700">
          This app is a self-help support tool designed to assist with behaviour change. It is not a substitute for professional medical advice.
        </p>
      </Card>

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

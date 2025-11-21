import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentQuestions, getDependenceLevel } from '../data/assessmentConfig';
import { saveAssessment } from '../utils/storage';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { CheckCircle2 } from 'lucide-react';

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
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
      finishAssessment(newAnswers);
    }
  };

  const finishAssessment = (finalAnswers: Record<number, number>) => {
    const totalScore = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
    const resultLevel = getDependenceLevel(totalScore);
    
    setLevel(resultLevel);
    setIsCompleted(true);

    saveAssessment({
      score: totalScore,
      level: resultLevel,
      completedAt: new Date().toISOString(),
    });
  };

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckCircle2 className="text-green-600 w-12 h-12" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Assessment Complete</h2>
          <p className="text-gray-500">Here is your result</p>
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

        <Button fullWidth size="lg" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

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

export default Assessment;

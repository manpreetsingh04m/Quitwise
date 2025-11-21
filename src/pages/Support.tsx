import React, { useState, useEffect } from 'react';
import { ifThenPlans, breathingExercise, motivationalMessages } from '../data/supportConfig';
import { getReasonsToQuit, saveReasonsToQuit, getTokenData, saveTokenData } from '../utils/storage';
import type { ReasonToQuit } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { HeartHandshake, Wind, Lightbulb, Plus, Trash2 } from 'lucide-react';

const Support: React.FC = () => {
  const [showCravingHelp, setShowCravingHelp] = useState(false);
  const [reasons, setReasons] = useState<ReasonToQuit[]>([]);
  const [newReason, setNewReason] = useState("");

  useEffect(() => {
    setReasons(getReasonsToQuit());
  }, []);

  const handleAddReason = () => {
    if (newReason.trim()) {
      const updatedReasons = [...reasons, { id: Date.now().toString(), text: newReason }];
      setReasons(updatedReasons);
      saveReasonsToQuit(updatedReasons);
      setNewReason("");
    }
  };

  const handleDeleteReason = (id: string) => {
    const updatedReasons = reasons.filter(r => r.id !== id);
    setReasons(updatedReasons);
    saveReasonsToQuit(updatedReasons);
  };

  const handleResistCraving = () => {
    const tokenData = getTokenData();
    const newData = {
      ...tokenData,
      tokens: tokenData.tokens + 1,
    };
    saveTokenData(newData);
    alert("Great job resisting! +1 Token");
    setShowCravingHelp(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-500">Tools to help you stay on track.</p>
      </header>

      <section>
        <Button 
          fullWidth 
          size="lg" 
          variant="danger" 
          className="shadow-red-100 shadow-xl"
          onClick={() => setShowCravingHelp(!showCravingHelp)}
        >
          {showCravingHelp ? "Close Help" : "I am having a craving now"}
        </Button>

        {showCravingHelp && (
          <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4">
            <Card className="bg-blue-50 border-blue-100">
              <div className="flex items-center space-x-2 mb-3 text-blue-800">
                <Wind className="w-5 h-5" />
                <h3 className="font-semibold">Breathe</h3>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-blue-900">
                {breathingExercise.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </Card>

            <Card className="bg-indigo-50 border-indigo-100">
              <div className="flex items-center space-x-2 mb-3 text-indigo-800">
                <Lightbulb className="w-5 h-5" />
                <h3 className="font-semibold">Try this Plan</h3>
              </div>
              <div className="space-y-3">
                {ifThenPlans.map((plan) => (
                  <div key={plan.id} className="bg-white p-3 rounded-lg text-sm shadow-sm">
                    <span className="font-medium text-gray-500">If</span> {plan.trigger}, <span className="font-medium text-gray-500">then</span> {plan.action}
                  </div>
                ))}
              </div>
            </Card>

            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <p className="font-medium text-gray-900 italic">"{motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}"</p>
            </div>

            <Button fullWidth variant="primary" onClick={handleResistCraving}>
              I resisted the craving!
            </Button>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <HeartHandshake className="w-5 h-5 text-pink-500" />
          <h2 className="text-lg font-semibold text-gray-900">My Reasons to Quit</h2>
        </div>
        
        <div className="space-y-3">
          {reasons.map((reason) => (
            <div key={reason.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm group">
              <span className="text-gray-800">{reason.text}</span>
              <button 
                onClick={() => handleDeleteReason(reason.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {reasons.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">Add your personal reasons to stay motivated.</p>
          )}

          <div className="flex space-x-2">
            <input
              type="text"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="e.g., To save money..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddReason()}
            />
            <Button onClick={handleAddReason} disabled={!newReason.trim()}>
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;

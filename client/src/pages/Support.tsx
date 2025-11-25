import React, { useState } from 'react';
import { ifThenPlans, breathingExercise, motivationalMessages } from '../data/supportConfig';
import { getReasonsToQuit, saveReasonsToQuit } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { updateUserProfile, createLogEntry } from '../services/firebaseService';
import type { ReasonToQuit } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/ToastProvider';
import { HeartHandshake, Wind, Lightbulb, Plus, Trash2 } from 'lucide-react';

const Support: React.FC = () => {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const [showCravingHelp, setShowCravingHelp] = useState(false);
  const [reasons, setReasons] = useState<ReasonToQuit[]>(() => getReasonsToQuit());
  const [newReason, setNewReason] = useState("");
  const [randomMessage] = useState(() => motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
  const { showToast } = useToast();

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

  const handleResistCraving = async () => {
    if (!user || !profile) {
      showToast({
        title: 'Please sign in',
        description: 'You need to be signed in to earn tokens.',
        type: 'info',
      });
      return;
    }

    try {
      // Create log entry
      await createLogEntry(user.uid, {
        type: 'resisted',
      });

      // Award token
      const newTokens = (profile.tokens || 0) + 1;
      await updateUserProfile(user.uid, {
        tokens: newTokens,
      });

      await refreshProfile();
      showToast({
        title: 'Great job!',
        description: '+1 token added for resisting.',
        type: 'success',
      });
      setShowCravingHelp(false);
    } catch (error) {
      console.error('Error logging resistance:', error);
      showToast({
        title: 'Failed to log resistance',
        type: 'error',
      });
    }
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
              <p className="font-medium text-gray-900 italic">"{randomMessage}"</p>
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
                aria-label={`Delete reason: ${reason.text}`}
                title="Delete reason"
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
            <Button onClick={handleAddReason} disabled={!newReason.trim()} aria-label="Add reason" title="Add reason">
              <Plus className="w-5 h-5" />
              <span className="sr-only">Add reason</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;

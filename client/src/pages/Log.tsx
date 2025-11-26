import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { createLogEntry, getUserLogs } from '../services/firebaseService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useToast } from '../components/ui/ToastProvider';
import { Plus, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import type { LogEntry, TriggerCategory, MoodLevel } from '../types';

const Log: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    if (!user) return;
    try {
      const userLogs = await getUserLogs(user.uid);
      setLogs(userLogs);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user, loadLogs]);

  const handleSubmit = async (logData: Omit<LogEntry, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;

    try {
      await createLogEntry(user.uid, logData);
      await loadLogs();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating log:', error);
      showToast({ title: 'Could not save log entry', type: 'error' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Daily Log</h1>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Log Entry
        </Button>
      </header>

      {showForm && (
        <LogEntryForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="space-y-3">
        {logs.length === 0 ? (
          <Card className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No log entries yet. Start tracking your progress!</p>
          </Card>
        ) : (
          logs.map((log) => (
            <LogEntryCard key={log.id} log={log} />
          ))
        )}
      </div>
    </div>
  );
};

const LogEntryForm: React.FC<{
  onSubmit: (data: Omit<LogEntry, 'id' | 'userId' | 'timestamp'>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [type, setType] = useState<'use' | 'craving' | 'resisted'>('craving');
  const [moodBefore, setMoodBefore] = useState<MoodLevel>('neutral');
  const [moodAfter, setMoodAfter] = useState<MoodLevel>('neutral');
  const [trigger, setTrigger] = useState<TriggerCategory>('stress');
  const [intensity, setIntensity] = useState(5);
  const [resisted, setResisted] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      moodBefore: type !== 'resisted' ? moodBefore : undefined,
      moodAfter: type === 'use' ? moodAfter : undefined,
      trigger: type !== 'resisted' ? trigger : undefined,
      intensity: type === 'craving' ? intensity : undefined,
      resisted: type === 'craving' ? resisted : undefined,
      notes: notes || undefined,
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="log-type" className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['use', 'craving', 'resisted'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  type === t
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {type !== 'resisted' && (
          <>
            <div>
              <label htmlFor="mood-before" className="block text-sm font-medium text-gray-700 mb-2">
                Mood Before
              </label>
              <select
                id="mood-before"
                value={moodBefore}
                onChange={(e) => setMoodBefore(e.target.value as MoodLevel)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="very-low">Very Low</option>
                <option value="low">Low</option>
                <option value="neutral">Neutral</option>
                <option value="good">Good</option>
                <option value="very-good">Very Good</option>
              </select>
            </div>

            <div>
              <label htmlFor="trigger" className="block text-sm font-medium text-gray-700 mb-2">
                Trigger
              </label>
              <select
                id="trigger"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value as TriggerCategory)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="stress">Stress</option>
                <option value="social">Social</option>
                <option value="boredom">Boredom</option>
                <option value="habit">Habit</option>
                <option value="other">Other</option>
              </select>
            </div>
          </>
        )}

        {type === 'use' && (
          <div>
            <label htmlFor="mood-after" className="block text-sm font-medium text-gray-700 mb-2">
              Mood After
            </label>
            <select
              id="mood-after"
              value={moodAfter}
              onChange={(e) => setMoodAfter(e.target.value as MoodLevel)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="very-low">Very Low</option>
              <option value="low">Low</option>
              <option value="neutral">Neutral</option>
              <option value="good">Good</option>
              <option value="very-good">Very Good</option>
            </select>
          </div>
        )}

        {type === 'craving' && (
          <>
            <div>
              <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 mb-2">
                Intensity (1-10): {intensity}
              </label>
              <input
                id="intensity"
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={resisted}
                onChange={(e) => setResisted(e.target.checked)}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">I resisted this craving</span>
            </label>
          </>
        )}

        <div>
          <label htmlFor="log-notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            id="log-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            rows={3}
          />
        </div>

        <div className="flex space-x-3">
          <Button type="button" variant="outline" fullWidth onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" fullWidth>
            Save
          </Button>
        </div>
      </form>
    </Card>
  );
};

const LogEntryCard: React.FC<{ log: LogEntry }> = ({ log }) => {
  const date = new Date(log.timestamp);
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Card>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              log.type === 'use' ? 'bg-red-100 text-red-700' :
              log.type === 'craving' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {log.type}
            </span>
            <span className="text-sm text-gray-500">{dateStr} at {timeStr}</span>
          </div>

          {log.trigger && (
            <p className="text-sm text-gray-600 mb-1">
              Trigger: <span className="font-medium capitalize">{log.trigger}</span>
            </p>
          )}

          {log.intensity && (
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Intensity: {log.intensity}/10</span>
            </div>
          )}

          {log.cost && (
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">₹{log.cost.toFixed(2)}</span>
            </div>
          )}

          {log.notes && (
            <p className="text-sm text-gray-600 mt-2">{log.notes}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Log;


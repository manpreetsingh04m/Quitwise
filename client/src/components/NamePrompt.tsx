import React, { useEffect, useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile } from '../services/firebaseService';
import { useToast } from './ui/ToastProvider';

const NamePrompt: React.FC = () => {
  const { profile, loading, refreshProfile } = useProfile();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const shouldPrompt = !!user && !loading && !profile?.displayName;

  useEffect(() => {
    if (profile?.displayName) {
      setName(profile.displayName);
    } else {
      setName('');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    try {
      setSaving(true);
      await updateUserProfile(user.uid, { displayName: name.trim() });
      await refreshProfile();
      showToast({ title: 'Name saved', type: 'success' });
    } catch (error) {
      console.error('Error saving display name:', error);
      showToast({ title: 'Could not save name', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!shouldPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <Card className="w-full max-w-sm space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">Tell us your name</h2>
          <p className="text-sm text-gray-500">
            Your name appears in the community and on your personalized plan.
          </p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Aditi Sharma"
            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <Button type="submit" fullWidth disabled={!name.trim() || saving}>
            {saving ? 'Saving...' : 'Save name'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default NamePrompt;

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getCBTLessons, getUserProfile, markLessonCompleted } from '../services/firebaseService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { BookOpen, CheckCircle2, Clock, Circle } from 'lucide-react';
import type { CBTLesson } from '../types';
import { useToast } from '../components/ui/ToastProvider';

const CBTLibrary: React.FC = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<CBTLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<CBTLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [savingCompletion, setSavingCompletion] = useState(false);
  const { showToast } = useToast();

  const loadLessons = useCallback(async () => {
    try {
      // For now, use default lessons if Firebase doesn't have them
      const defaultLessons: CBTLesson[] = [
        {
          id: '1',
          title: 'How Nicotine Affects Your Brain and Mood',
          content: `Nicotine is a powerful stimulant that affects your brain's reward system. When you vape or smoke, nicotine reaches your brain within seconds, binding to receptors and releasing dopamine—the "feel-good" chemical.

This creates a temporary sense of pleasure and relaxation. However, your brain adapts by reducing its natural dopamine production, making you feel worse when you're not using nicotine. This is why cravings intensify over time.

Understanding this cycle helps you recognize that the relief you feel is temporary and comes at a long-term cost to your mood and mental health.`,
          readingTime: 3,
          category: 'psychoeducation',
          unlocked: true,
          order: 1,
        },
        {
          id: '2',
          title: 'Cognitive Distortions That Keep You Hooked',
          content: `Several thinking patterns can trap you in the cycle of nicotine use:

1. **All-or-Nothing Thinking**: "I had one cigarette, so I've failed completely."
   - Reality: One slip doesn't erase your progress. Recovery is a journey.

2. **Catastrophizing**: "I can't handle stress without vaping."
   - Reality: You've handled stress before nicotine, and you can learn to do it again.

3. **Emotional Reasoning**: "I feel anxious, so I need to vape."
   - Reality: Feelings are temporary. Nicotine doesn't solve anxiety; it creates dependency.

4. **Minimizing**: "It's just one cigarette, it's not a big deal."
   - Reality: Each use reinforces the habit and makes quitting harder.

Recognize these patterns when they appear, and challenge them with evidence.`,
          readingTime: 4,
          category: 'psychoeducation',
          unlocked: true,
          order: 2,
        },
        {
          id: '3',
          title: 'Habit Loops: Cue–Routine–Reward',
          content: `Every habit follows a loop: Cue → Routine → Reward.

**Cue**: The trigger (stress, coffee, social situation)
**Routine**: The behavior (vaping/smoking)
**Reward**: The feeling (relief, social connection, break)

To break the habit, you need to:
1. **Identify your cues**: When and where do you use?
2. **Change the routine**: Replace vaping with a healthier behavior
3. **Maintain the reward**: Find alternative ways to get the same feeling

Example:
- Old: Stress (cue) → Vape (routine) → Relief (reward)
- New: Stress (cue) → Deep breathing (routine) → Relief (reward)

The cue and reward stay the same; only the routine changes.`,
          readingTime: 3,
          category: 'psychoeducation',
          unlocked: true,
          order: 3,
        },
        {
          id: '4',
          title: 'Relapse is Data, Not Failure',
          content: `If you use nicotine after quitting, it's not a failure—it's information.

**What to do after a relapse:**
1. Don't beat yourself up. Shame makes it harder to continue.
2. Analyze what happened: What was the trigger? What were you feeling?
3. Learn from it: What could you do differently next time?
4. Get back on track immediately. One use doesn't mean you're back to square one.

**Remember**: Most people who successfully quit have multiple attempts. Each attempt teaches you something new about your triggers and coping strategies.

The goal isn't perfection; it's progress.`,
          readingTime: 2,
          category: 'psychoeducation',
          unlocked: true,
          order: 4,
        },
        {
          id: '5',
          title: 'Urge Surfing Technique',
          content: `Urge surfing is a mindfulness technique that helps you ride out cravings without acting on them.

**How it works:**
1. Notice the craving without judgment
2. Observe it like a wave—it builds, peaks, and subsides
3. Don't fight it; just watch it
4. Remind yourself: "This will pass in 5-10 minutes"

**Practice:**
- When a craving hits, set a timer for 10 minutes
- During that time, focus on your breathing
- Notice the physical sensations without acting
- After 10 minutes, re-evaluate: Do you still need to use?

Most cravings peak within 5-10 minutes. If you can ride them out, they become manageable.`,
          readingTime: 3,
          category: 'technique',
          unlocked: user ? true : false,
          order: 5,
        },
      ];

      const firebaseLessons = await getCBTLessons();
      setLessons(firebaseLessons.length > 0 ? firebaseLessons : defaultLessons);
    } catch (error) {
      console.error('Error loading lessons:', error);
      // Use default lessons on error
      setLessons([
        {
          id: '1',
          title: 'How Nicotine Affects Your Brain and Mood',
          content: 'Content here...',
          readingTime: 3,
          category: 'psychoeducation',
          unlocked: true,
          order: 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchCompletedLessons = useCallback(async () => {
    if (!user) {
      setCompletedLessons([]);
      return;
    }
    try {
      const profile = await getUserProfile(user.uid);
      setCompletedLessons(profile?.completedLessons || []);
    } catch (error) {
      console.error('Error loading completed lessons:', error);
      setCompletedLessons([]);
    }
  }, [user]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  useEffect(() => {
    if (user) {
      fetchCompletedLessons();
    } else {
      setCompletedLessons([]);
    }
  }, [user, fetchCompletedLessons]);

  const handleMarkCompleted = async () => {
    if (!user || !selectedLesson) {
      showToast({ title: 'Please sign in to track progress', type: 'info' });
      return;
    }
    if (completedLessons.includes(selectedLesson.id)) {
      setSelectedLesson(null);
      return;
    }
    try {
      setSavingCompletion(true);
      await markLessonCompleted(user.uid, selectedLesson.id);
      setCompletedLessons((prev) => Array.from(new Set([...prev, selectedLesson.id])));
      showToast({
        title: 'Lesson completed',
        description: `"${selectedLesson.title}" marked as done.`,
        type: 'success',
      });
      setSelectedLesson(null);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      showToast({ title: 'Could not save completion', type: 'error' });
    } finally {
      setSavingCompletion(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (selectedLesson) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setSelectedLesson(null)}>
            ← Back
          </Button>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{selectedLesson.title}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{selectedLesson.readingTime} min read</span>
              </div>
            </div>

            <div className="prose max-w-none">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {selectedLesson.content}
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button
                fullWidth
                onClick={handleMarkCompleted}
                disabled={!user || savingCompletion}
              >
                {completedLessons.includes(selectedLesson.id)
                  ? 'Completed'
                  : savingCompletion
                  ? 'Saving...'
                  : 'Mark as Done'}
              </Button>
              {!user && (
                <p className="text-center text-xs text-gray-500">
                  Sign in to track which lessons you've completed.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <header>
        <div className="flex items-center space-x-2 mb-2">
          <BookOpen className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">CBT Library</h1>
        </div>
        <p className="text-sm text-gray-500">Learn psychological techniques to support your quit journey</p>
      </header>

      <div className="space-y-3">
        {lessons.map((lesson) => {
          const isCompleted = completedLessons.includes(lesson.id);
          return (
            <Card
              key={lesson.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setSelectedLesson(lesson)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center space-x-2">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="capitalize">{lesson.category}</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{lesson.readingTime} min</span>
                    </span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isCompleted ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'
                  }`}
                >
                  {isCompleted ? 'Completed' : 'Pending'}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {!user && (
        <Card className="bg-blue-50 border-blue-100">
          <p className="text-sm text-blue-700">
            Sign in to unlock all lessons and track your progress
          </p>
        </Card>
      )}
    </div>
  );
};

export default CBTLibrary;


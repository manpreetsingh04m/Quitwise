import type { Question } from '../types';

// Category 1: Initial Assessment Questions (1-11)
const initialAssessmentQuestions: Question[] = [
  {
    id: 1,
    text: "How many cigarettes or vape sessions do you typically have in a day?",
    category: "initial",
    options: [
      { text: "1-5", score: 1 },
      { text: "6-10", score: 2 },
      { text: "11-20", score: 3 },
      { text: "21-30", score: 4 },
      { text: "31 or more", score: 5 },
    ],
  },
  {
    id: 2,
    text: "At what times do you usually smoke or vape?",
    category: "initial",
    options: [
      { text: "Only in the morning", score: 1 },
      { text: "Morning and evening", score: 2 },
      { text: "Throughout the day, evenly spaced", score: 3 },
      { text: "Frequently, whenever I feel like it", score: 4 },
      { text: "Constantly, almost every hour", score: 5 },
    ],
  },
  {
    id: 3,
    text: "How soon after waking do you take your first cigarette/vape?",
    category: "initial",
    options: [
      { text: "After 60 minutes", score: 0 },
      { text: "31-60 minutes", score: 1 },
      { text: "6-30 minutes", score: 2 },
      { text: "Within 5 minutes", score: 3 },
    ],
  },
  {
    id: 4,
    text: "Do you smoke/vape more when alone or around others?",
    category: "initial",
    options: [
      { text: "More when around others", score: 2 },
      { text: "About the same", score: 1 },
      { text: "More when alone", score: 3 },
      { text: "I don't notice a difference", score: 1 },
    ],
  },
  {
    id: 5,
    text: "Which emotions usually lead you to smoke/vape? (e.g., stress, boredom, anger, anxiety)",
    category: "initial",
    options: [
      { text: "None specific, just habit", score: 1 },
      { text: "One emotion (e.g., stress)", score: 2 },
      { text: "Two emotions", score: 3 },
      { text: "Three or more emotions", score: 4 },
    ],
  },
  {
    id: 6,
    text: "What thoughts run in your mind before using nicotine?",
    category: "initial",
    options: [
      { text: "No specific thoughts, it's automatic", score: 3 },
      { text: "I need this to feel better", score: 4 },
      { text: "I deserve this", score: 3 },
      { text: "I'll quit tomorrow", score: 2 },
      { text: "I can control this", score: 2 },
    ],
  },
  {
    id: 7,
    text: "Do you feel smoking/vaping 'helps' you manage emotions? If yes, how?",
    category: "initial",
    options: [
      { text: "No, it doesn't help", score: 1 },
      { text: "Sometimes, but I'm not sure", score: 2 },
      { text: "Yes, it helps me relax", score: 3 },
      { text: "Yes, it helps with stress and anxiety", score: 4 },
      { text: "Yes, I feel I can't function without it", score: 5 },
    ],
  },
  {
    id: 8,
    text: "On a scale of 1–10, how important is quitting for you?",
    category: "initial",
    options: [
      { text: "1-3 (Not very important)", score: 1 },
      { text: "4-6 (Somewhat important)", score: 2 },
      { text: "7-8 (Very important)", score: 3 },
      { text: "9-10 (Extremely important)", score: 4 },
    ],
  },
  {
    id: 9,
    text: "On a scale of 1–10, how confident are you that you can quit?",
    category: "initial",
    options: [
      { text: "1-3 (Not confident)", score: 1 },
      { text: "4-6 (Somewhat confident)", score: 2 },
      { text: "7-8 (Confident)", score: 3 },
      { text: "9-10 (Very confident)", score: 4 },
    ],
  },
  {
    id: 10,
    text: "What benefits do you expect if you quit?",
    category: "initial",
    options: [
      { text: "Health improvements", score: 1 },
      { text: "Save money", score: 1 },
      { text: "Health and money", score: 2 },
      { text: "Health, money, and self-respect", score: 3 },
      { text: "Multiple benefits (health, money, relationships, confidence)", score: 4 },
    ],
  },
  {
    id: 11,
    text: "What is the biggest fear you have about quitting?",
    category: "initial",
    options: [
      { text: "I don't have any fears", score: 1 },
      { text: "Withdrawal symptoms", score: 2 },
      { text: "Weight gain", score: 2 },
      { text: "Not being able to handle stress", score: 3 },
      { text: "Failure/relapse", score: 3 },
      { text: "Losing a way to cope", score: 4 },
    ],
  },
];

// Category 2: Trigger & Thought Pattern Questions (12-17)
const triggerThoughtQuestions: Question[] = [
  {
    id: 12,
    text: "In the last few days, which situations triggered cravings the most?",
    category: "trigger-thought",
    options: [
      { text: "Work stress", score: 3 },
      { text: "Social situations", score: 2 },
      { text: "Boredom or downtime", score: 3 },
      { text: "After meals", score: 2 },
      { text: "Emotional distress", score: 4 },
      { text: "Multiple situations", score: 4 },
    ],
  },
  {
    id: 13,
    text: "What automatic thoughts came right before you smoked/vaped?",
    category: "trigger-thought",
    options: [
      { text: "I need this now", score: 4 },
      { text: "Just one won't hurt", score: 3 },
      { text: "I'll quit tomorrow", score: 2 },
      { text: "I can't handle this without it", score: 5 },
      { text: "I deserve this", score: 3 },
      { text: "No specific thought, just automatic", score: 4 },
    ],
  },
  {
    id: 14,
    text: "What did you believe the cigarette/vape would do for you at that moment?",
    category: "trigger-thought",
    options: [
      { text: "Help me relax", score: 3 },
      { text: "Reduce stress or anxiety", score: 4 },
      { text: "Help me focus", score: 2 },
      { text: "Give me a break", score: 2 },
      { text: "Make me feel better emotionally", score: 4 },
      { text: "I don't know, just felt like it", score: 3 },
    ],
  },
  {
    id: 15,
    text: "Which alternative behaviour could have helped instead?",
    category: "trigger-thought",
    options: [
      { text: "Deep breathing", score: 1 },
      { text: "Going for a walk", score: 1 },
      { text: "Drinking water", score: 1 },
      { text: "Talking to someone", score: 1 },
      { text: "I don't know any alternatives", score: 3 },
      { text: "Nothing would help", score: 4 },
    ],
  },
  {
    id: 16,
    text: "How intense was the urge on a scale of 1–10?",
    category: "trigger-thought",
    options: [
      { text: "1-3 (Mild)", score: 1 },
      { text: "4-6 (Moderate)", score: 2 },
      { text: "7-8 (Strong)", score: 3 },
      { text: "9-10 (Overwhelming)", score: 4 },
    ],
  },
  {
    id: 17,
    text: "How did you feel after smoking/vaping compared to before?",
    category: "trigger-thought",
    options: [
      { text: "Much better", score: 4 },
      { text: "Slightly better", score: 3 },
      { text: "The same", score: 2 },
      { text: "Worse (guilty, disappointed)", score: 1 },
      { text: "Much worse", score: 0 },
    ],
  },
];

// Category 3: Daily Craving Log Questions (18-26)
const dailyCravingQuestions: Question[] = [
  {
    id: 18,
    text: "Did you smoke/vape today? If yes, how many times?",
    category: "daily-craving",
    options: [
      { text: "No, I didn't smoke/vape", score: 0 },
      { text: "1-2 times", score: 1 },
      { text: "3-5 times", score: 2 },
      { text: "6-10 times", score: 3 },
      { text: "11-20 times", score: 4 },
      { text: "21 or more times", score: 5 },
    ],
  },
  {
    id: 19,
    text: "What were you doing right before the craving?",
    category: "daily-craving",
    options: [
      { text: "Working", score: 2 },
      { text: "Relaxing or bored", score: 3 },
      { text: "After a meal", score: 2 },
      { text: "In a social situation", score: 2 },
      { text: "Feeling stressed or anxious", score: 4 },
      { text: "Waking up", score: 3 },
    ],
  },
  {
    id: 20,
    text: "What emotion were you feeling at that moment?",
    category: "daily-craving",
    options: [
      { text: "Calm or neutral", score: 1 },
      { text: "Happy or content", score: 1 },
      { text: "Bored", score: 2 },
      { text: "Stressed", score: 4 },
      { text: "Anxious", score: 4 },
      { text: "Angry or frustrated", score: 3 },
      { text: "Sad or depressed", score: 3 },
    ],
  },
  {
    id: 21,
    text: "How strong was the craving (1–10)?",
    category: "daily-craving",
    options: [
      { text: "1-3 (Mild)", score: 1 },
      { text: "4-6 (Moderate)", score: 2 },
      { text: "7-8 (Strong)", score: 3 },
      { text: "9-10 (Overwhelming)", score: 4 },
    ],
  },
  {
    id: 22,
    text: "Did you try any coping strategy before using nicotine?",
    category: "daily-craving",
    options: [
      { text: "Yes, and it worked", score: 0 },
      { text: "Yes, but it didn't work", score: 2 },
      { text: "No, I didn't try anything", score: 3 },
      { text: "I don't know any coping strategies", score: 3 },
    ],
  },
  {
    id: 23,
    text: "How effective was that strategy (1–10)?",
    category: "daily-craving",
    options: [
      { text: "1-3 (Not effective)", score: 3 },
      { text: "4-6 (Somewhat effective)", score: 2 },
      { text: "7-8 (Effective)", score: 1 },
      { text: "9-10 (Very effective)", score: 0 },
      { text: "I didn't try any strategy", score: 3 },
    ],
  },
  {
    id: 24,
    text: "What thought convinced you to give in, if you did?",
    category: "daily-craving",
    options: [
      { text: "Just one won't hurt", score: 3 },
      { text: "I need this right now", score: 4 },
      { text: "I'll quit tomorrow", score: 2 },
      { text: "I can't handle this without it", score: 5 },
      { text: "I deserve this", score: 3 },
      { text: "I didn't give in", score: 0 },
    ],
  },
  {
    id: 25,
    text: "What did this cigarette/vape cost you today (₹)?",
    category: "daily-craving",
    options: [
      { text: "Less than ₹50", score: 1 },
      { text: "₹50-100", score: 2 },
      { text: "₹100-200", score: 3 },
      { text: "₹200-300", score: 4 },
      { text: "More than ₹300", score: 5 },
    ],
  },
  {
    id: 26,
    text: "What could that money have been used for instead?",
    category: "daily-craving",
    options: [
      { text: "Food or groceries", score: 1 },
      { text: "Entertainment", score: 1 },
      { text: "Savings or investment", score: 2 },
      { text: "Something meaningful (gift, experience)", score: 2 },
      { text: "Multiple things", score: 2 },
    ],
  },
];

// Category 4: Relapse Reflection Questions (27-33)
const relapseReflectionQuestions: Question[] = [
  {
    id: 27,
    text: "What led to your relapse today?",
    category: "relapse-reflection",
    options: [
      { text: "Stressful situation", score: 3 },
      { text: "Social pressure", score: 2 },
      { text: "Strong emotional trigger", score: 4 },
      { text: "Habitual trigger (time, place)", score: 3 },
      { text: "Lack of coping strategies", score: 3 },
      { text: "Multiple factors", score: 4 },
    ],
  },
  {
    id: 28,
    text: "Which thought made the relapse feel justified in the moment?",
    category: "relapse-reflection",
    options: [
      { text: "Just one won't hurt", score: 3 },
      { text: "I need this to function", score: 4 },
      { text: "I'll start fresh tomorrow", score: 2 },
      { text: "I've already failed, so why not", score: 4 },
      { text: "I can't do this", score: 5 },
      { text: "I deserve this", score: 3 },
    ],
  },
  {
    id: 29,
    text: "How accurate was that thought when you reflect now?",
    category: "relapse-reflection",
    options: [
      { text: "Completely accurate", score: 4 },
      { text: "Somewhat accurate", score: 3 },
      { text: "Not very accurate", score: 2 },
      { text: "Completely inaccurate", score: 1 },
      { text: "I'm not sure", score: 2 },
    ],
  },
  {
    id: 30,
    text: "Which emotion was strongest right before the relapse?",
    category: "relapse-reflection",
    options: [
      { text: "Stress", score: 4 },
      { text: "Anxiety", score: 4 },
      { text: "Boredom", score: 2 },
      { text: "Anger or frustration", score: 3 },
      { text: "Sadness or depression", score: 3 },
      { text: "No strong emotion", score: 2 },
    ],
  },
  {
    id: 31,
    text: "What would have helped you respond differently?",
    category: "relapse-reflection",
    options: [
      { text: "A coping strategy", score: 1 },
      { text: "Support from someone", score: 1 },
      { text: "Reminder of my goals", score: 1 },
      { text: "Distraction", score: 1 },
      { text: "I don't know", score: 3 },
      { text: "Nothing would have helped", score: 4 },
    ],
  },
  {
    id: 32,
    text: "What can we modify in your quit plan based on today?",
    category: "relapse-reflection",
    options: [
      { text: "Add more coping strategies", score: 1 },
      { text: "Identify triggers better", score: 1 },
      { text: "Adjust the quit strategy", score: 1 },
      { text: "Increase support", score: 1 },
      { text: "Multiple modifications needed", score: 2 },
    ],
  },
  {
    id: 33,
    text: "What reminder would help you the next time this situation happens?",
    category: "relapse-reflection",
    options: [
      { text: "My reasons for quitting", score: 1 },
      { text: "How I'll feel after (guilt, disappointment)", score: 1 },
      { text: "My progress so far", score: 1 },
      { text: "The money I'm saving", score: 1 },
      { text: "Multiple reminders", score: 1 },
    ],
  },
];

// Combine all questions
export const assessmentQuestions: Question[] = [
  ...initialAssessmentQuestions,
  ...triggerThoughtQuestions,
  ...dailyCravingQuestions,
  ...relapseReflectionQuestions,
];

// Get questions by category
export const getQuestionsByCategory = (category: Question['category']): Question[] => {
  return assessmentQuestions.filter(q => q.category === category);
};

// Get initial assessment questions (Category 1)
export const getInitialAssessmentQuestions = (): Question[] => {
  return getQuestionsByCategory('initial');
};

// Get trigger & thought pattern questions (Category 2)
export const getTriggerThoughtQuestions = (): Question[] => {
  return getQuestionsByCategory('trigger-thought');
};

// Get daily craving log questions (Category 3)
export const getDailyCravingQuestions = (): Question[] => {
  return getQuestionsByCategory('daily-craving');
};

// Get relapse reflection questions (Category 4)
export const getRelapseReflectionQuestions = (): Question[] => {
  return getQuestionsByCategory('relapse-reflection');
};

export const getDependenceLevel = (score: number): "low" | "moderate" | "high" => {
  // Adjusted scoring for 33 questions (max score ~150)
  if (score <= 50) return "low";
  if (score <= 100) return "moderate";
  return "high";
};

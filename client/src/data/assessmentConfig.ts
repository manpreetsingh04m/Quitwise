import type { Question } from '../types';

export const assessmentQuestions: Question[] = [
  {
    id: 1,
    text: "How soon after you wake up do you vape/smoke?",
    category: "general",
    options: [
      { text: "Within 5 minutes", score: 3 },
      { text: "6-30 minutes", score: 2 },
      { text: "31-60 minutes", score: 1 },
      { text: "After 60 minutes", score: 0 },
    ],
  },
  {
    id: 2,
    text: "Do you find it difficult to refrain from vaping/smoking in places where it is forbidden?",
    category: "general",
    options: [
      { text: "Yes", score: 1 },
      { text: "No", score: 0 },
    ],
  },
  {
    id: 3,
    text: "Which vape/cigarette would you hate most to give up?",
    category: "general",
    options: [
      { text: "The first one in the morning", score: 1 },
      { text: "Any other", score: 0 },
    ],
  },
  {
    id: 4,
    text: "How many times do you vape/smoke per day?",
    category: "general",
    options: [
      { text: "31 or more", score: 3 },
      { text: "21-30", score: 2 },
      { text: "11-20", score: 1 },
      { text: "10 or less", score: 0 },
    ],
  },
  {
    id: 5,
    text: "Do you vape/smoke more frequently during the first hours after waking than during the rest of the day?",
    category: "general",
    options: [
      { text: "Yes", score: 1 },
      { text: "No", score: 0 },
    ],
  },
  {
    id: 6,
    text: "Do you vape/smoke if you are so ill that you are in bed most of the day?",
    category: "general",
    options: [
      { text: "Yes", score: 1 },
      { text: "No", score: 0 },
    ],
  },
];

export const getDependenceLevel = (score: number): "low" | "moderate" | "high" => {
  if (score <= 3) return "low";
  if (score <= 6) return "moderate";
  return "high";
};

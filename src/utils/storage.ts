import type { AssessmentResult, TokenData, ReasonToQuit } from '../types';

const KEYS = {
  ASSESSMENT: 'bc_assessment',
  TOKENS: 'bc_tokens',
  REASONS: 'bc_reasons',
};

export const getAssessment = (): AssessmentResult | null => {
  const data = localStorage.getItem(KEYS.ASSESSMENT);
  return data ? JSON.parse(data) : null;
};

export const saveAssessment = (result: AssessmentResult) => {
  localStorage.setItem(KEYS.ASSESSMENT, JSON.stringify(result));
};

export const getTokenData = (): TokenData => {
  const data = localStorage.getItem(KEYS.TOKENS);
  return data ? JSON.parse(data) : { lastUseTimestamp: null, tokens: 0, streakHours: 0 };
};

export const saveTokenData = (data: TokenData) => {
  localStorage.setItem(KEYS.TOKENS, JSON.stringify(data));
};

export const getReasonsToQuit = (): ReasonToQuit[] => {
  const data = localStorage.getItem(KEYS.REASONS);
  return data ? JSON.parse(data) : [];
};

export const saveReasonsToQuit = (reasons: ReasonToQuit[]) => {
  localStorage.setItem(KEYS.REASONS, JSON.stringify(reasons));
};

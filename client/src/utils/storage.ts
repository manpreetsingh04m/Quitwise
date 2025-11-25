import type { ReasonToQuit } from '../types';

const KEYS = {
  REASONS: 'bc_reasons',
};

export const getReasonsToQuit = (): ReasonToQuit[] => {
  const data = localStorage.getItem(KEYS.REASONS);
  return data ? JSON.parse(data) : [];
};

export const saveReasonsToQuit = (reasons: ReasonToQuit[]) => {
  localStorage.setItem(KEYS.REASONS, JSON.stringify(reasons));
};

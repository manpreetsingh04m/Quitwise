export const calculateStreak = (lastUseTimestamp: number | null): { hours: number; days: number } => {
  if (!lastUseTimestamp) return { hours: 0, days: 0 };
  
  const now = Date.now();
  const diff = now - lastUseTimestamp;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  return { hours, days };
};

export const calculateTokens = (lastUseTimestamp: number | null, currentTokens: number): number => {
  if (!lastUseTimestamp) return currentTokens;
  
  // Simple logic: 1 token per hour clean. 
  // In a real app, we might want to store 'lastTokenSync' to avoid double counting,
  // but for this simple version, we'll just calculate total potential tokens based on streak
  // and assume the user syncs or we update it. 
  // Actually, the requirement says "Convert that to tokens". 
  // Let's stick to a simpler model: Tokens are added manually or via a "Sync" button that calculates *new* tokens.
  // But to keep it stateless-ish, maybe we just calculate total tokens earned from streak?
  // No, because user spends tokens.
  // So we need to add tokens incrementally.
  
  // Helper to just get hours passed.
  const { hours } = calculateStreak(lastUseTimestamp);
  return hours; 
};

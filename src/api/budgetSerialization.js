export function serializeBudgets(budgets) {
  return JSON.stringify(
    budgets.map((b) => ({
      ...b,
      transactions: (b.transactions || []).map((tx) => ({
        ...tx,
        date: tx.date instanceof Date ? tx.date.toISOString() : tx.date,
      })),
    })),
  );
}

export function deserializeBudgets(raw) {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!Array.isArray(parsed)) return [];
  return parsed.map((b) => ({
    ...b,
    transactions: (b.transactions || []).map((tx) => ({
      ...tx,
      date: new Date(tx.date),
    })),
  }));
}

export function serializeBudgetState(budgets, activeBudgetIndex) {
  return {
    budgets: JSON.parse(serializeBudgets(budgets)),
    activeBudgetIndex,
  };
}

import { apiRequest } from './client';
import { deserializeBudgets } from './budgetSerialization';
import { isApiEnabled } from './config';

function normalizeState(payload) {
  return {
    budgets: deserializeBudgets(payload?.budgets ?? []),
    activeBudgetIndex: payload?.activeBudgetIndex ?? 0,
  };
}

export async function fetchBudgetState() {
  if (!isApiEnabled()) return null;

  const payload = await apiRequest('/api/budgets');
  return normalizeState(payload);
}

export async function syncBudgetState(budgets, activeBudgetIndex) {
  if (!isApiEnabled()) return null;

  const payload = await apiRequest('/api/budgets/sync', {
    method: 'PUT',
    body: {
      budgets: budgets.map((b) => ({
        ...b,
        transactions: (b.transactions || []).map((tx) => ({
          ...tx,
          date: tx.date instanceof Date ? tx.date.toISOString() : tx.date,
        })),
      })),
      activeBudgetIndex,
    },
  });

  return normalizeState(payload);
}

export async function createBudgetOnServer(budget) {
  if (!isApiEnabled()) return null;

  const payload = await apiRequest('/api/budgets', {
    method: 'POST',
    body: { budget },
  });

  return normalizeState(payload);
}

export async function updateBudgetOnServer(budgetId, patch) {
  if (!isApiEnabled()) return null;

  const payload = await apiRequest(`/api/budgets/${budgetId}`, {
    method: 'PATCH',
    body: patch,
  });

  return normalizeState(payload);
}

export async function addTransactionOnServer(budgetId, transaction) {
  if (!isApiEnabled()) return null;

  const payload = await apiRequest(`/api/budgets/${budgetId}/transactions`, {
    method: 'POST',
    body: {
      transaction: {
        ...transaction,
        date: transaction.date instanceof Date
          ? transaction.date.toISOString()
          : transaction.date,
      },
    },
  });

  return normalizeState(payload);
}

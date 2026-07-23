import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serializeBudgets, deserializeBudgets } from '../api/budgetSerialization';
import { fetchBudgetState, syncBudgetState } from '../api/budgetApi';
import { isApiEnabled } from '../api/config';

const BudgetContext = createContext();

const BUDGETS_STORAGE_KEY = '@mybudget/budgets';
const ACTIVE_BUDGET_INDEX_KEY = '@mybudget/activeBudgetIndex';

// Legacy keys (migrated into budgets array)
const BUDGET_STORAGE_KEY = '@mybudget/budget';
const BUDGET_NAME_STORAGE_KEY = '@mybudget/budgetName';
const TIMEFRAME_STORAGE_KEY = '@mybudget/timeframe';
const PERIOD_START_STORAGE_KEY = '@mybudget/periodStart';

export const TIME_UNITS = {
  days: { label: 'Days', singular: 'day', max: 31 },
  weeks: { label: 'Weeks', singular: 'week', max: 52 },
  months: { label: 'Months', singular: 'month', max: 12 },
  years: { label: 'Years', singular: 'year', max: 10 },
};

export const BUDGET_NAME_PRESETS = [
  { id: 'general', label: 'General', icon: '💰' },
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'home-bills', label: 'Home Bills', icon: '🏠' },
  { id: 'self-care', label: 'Self Care', icon: '✨' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'health', label: 'Health', icon: '💚' },
];

export function isValidBudgetName(name) {
  return typeof name === 'string' && name.trim().length > 0;
}

const LEGACY_TIMEFRAMES = {
  weekly: { unit: 'weeks', duration: 1 },
  monthly: { unit: 'months', duration: 1 },
  yearly: { unit: 'years', duration: 1 },
};

export function formatTimeframe(timeframe) {
  if (!timeframe?.unit || !TIME_UNITS[timeframe.unit]) return '';
  const { unit, duration } = timeframe;
  const meta = TIME_UNITS[unit];
  const count = duration || 1;
  const word = count === 1 ? meta.singular : meta.label.toLowerCase();
  return `${count} ${word.charAt(0).toUpperCase() + word.slice(1)}`;
}

export function formatTimeframePeriod(timeframe) {
  if (!timeframe?.unit || !TIME_UNITS[timeframe.unit]) return 'period';
  const { unit, duration } = timeframe;
  const meta = TIME_UNITS[unit];
  const count = duration || 1;
  const word = count === 1 ? meta.singular : meta.label.toLowerCase();
  return `${count} ${word}`;
}

function parseTimeframe(saved) {
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    if (parsed?.unit && TIME_UNITS[parsed.unit] && parsed.duration >= 1) {
      return parsed;
    }
  } catch {
    // fall through to legacy string format
  }
  if (LEGACY_TIMEFRAMES[saved]) return LEGACY_TIMEFRAMES[saved];
  return null;
}

function isValidTimeframe(timeframe) {
  if (!timeframe?.unit || !TIME_UNITS[timeframe.unit]) return false;
  const { duration } = timeframe;
  return duration >= 1 && duration <= TIME_UNITS[timeframe.unit].max;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function timeframeToTotalDays(timeframe, fromDate = new Date()) {
  if (!isValidTimeframe(timeframe)) return 0;
  const { unit, duration } = timeframe;
  if (unit === 'days') return duration;
  if (unit === 'weeks') return duration * 7;

  const end = new Date(fromDate);
  if (unit === 'months') end.setMonth(end.getMonth() + duration);
  else if (unit === 'years') end.setFullYear(end.getFullYear() + duration);
  return Math.max(1, Math.round((end - fromDate) / MS_PER_DAY));
}

export function getBudgetPeriodDays(timeframe, periodStartDate) {
  if (!isValidTimeframe(timeframe) || !periodStartDate) {
    return { totalDays: 0, daysRemaining: 0 };
  }

  const start = new Date(periodStartDate);
  const totalDays = timeframeToTotalDays(timeframe, start);
  const daysElapsed = Math.min(
    totalDays,
    Math.max(0, Math.floor((Date.now() - start.getTime()) / MS_PER_DAY)),
  );
  return { totalDays, daysRemaining: totalDays - daysElapsed };
}

export function getOnTrackProgressForDaysRemaining(budget, remaining, totalDays, daysRemaining) {
  if (totalDays <= 0 || budget <= 0) return 100;

  const expectedRemaining = budget * (daysRemaining / totalDays);
  if (expectedRemaining <= 0) return remaining >= 0 ? 100 : 0;

  return (remaining / expectedRemaining) * 100;
}

export function getOnTrackProgress(budget, remaining, timeframe, periodStartDate) {
  const { totalDays, daysRemaining } = getBudgetPeriodDays(timeframe, periodStartDate);
  return getOnTrackProgressForDaysRemaining(budget, remaining, totalDays, daysRemaining);
}

export function getBudgetMetrics(budgetItem) {
  if (!budgetItem) {
    return {
      spent: 0,
      remaining: 0,
      percentRemaining: '0.00',
      onTrackProgress: 100,
      daysRemaining: 0,
      totalDays: 0,
    };
  }

  const spent = (budgetItem.transactions || []).reduce((sum, t) => sum + t.amount, 0);
  const remaining = budgetItem.amount - spent;
  const percentRemaining = budgetItem.amount > 0
    ? ((remaining / budgetItem.amount) * 100).toFixed(2)
    : '0.00';
  const onTrackProgress = getOnTrackProgress(
    budgetItem.amount,
    remaining,
    budgetItem.timeframe,
    budgetItem.periodStartDate,
  );
  const { daysRemaining, totalDays } = getBudgetPeriodDays(
    budgetItem.timeframe,
    budgetItem.periodStartDate,
  );

  return { spent, remaining, percentRemaining, onTrackProgress, daysRemaining, totalDays };
}

function createBudgetId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createBudget({ amount, timeframe, name = '', periodStartDate }) {
  return {
    id: createBudgetId(),
    name,
    amount,
    timeframe,
    periodStartDate: periodStartDate || new Date().toISOString(),
    transactions: [],
  };
}

async function loadBudgetsFromStorage() {
  const savedBudgets = await AsyncStorage.getItem(BUDGETS_STORAGE_KEY);
  if (savedBudgets) {
    try {
      return deserializeBudgets(savedBudgets);
    } catch {
      return [];
    }
  }

  const [savedBudget, savedBudgetName, savedTimeframe, savedPeriodStart] = await Promise.all([
    AsyncStorage.getItem(BUDGET_STORAGE_KEY),
    AsyncStorage.getItem(BUDGET_NAME_STORAGE_KEY),
    AsyncStorage.getItem(TIMEFRAME_STORAGE_KEY),
    AsyncStorage.getItem(PERIOD_START_STORAGE_KEY),
  ]);

  const parsedAmount = savedBudget !== null ? parseFloat(savedBudget) : NaN;
  const parsedTimeframe = parseTimeframe(savedTimeframe);

  if (!isNaN(parsedAmount) && parsedAmount > 0 && isValidTimeframe(parsedTimeframe)) {
    const periodStart = savedPeriodStart && !isNaN(new Date(savedPeriodStart).getTime())
      ? savedPeriodStart
      : new Date().toISOString();

    return [createBudget({
      amount: parsedAmount,
      timeframe: parsedTimeframe,
      name: savedBudgetName || '',
      periodStartDate: periodStart,
    })];
  }

  return [];
}

async function loadBudgetState() {
  const localBudgets = await loadBudgetsFromStorage();
  const savedIndex = await AsyncStorage.getItem(ACTIVE_BUDGET_INDEX_KEY);
  const parsedIndex = savedIndex !== null ? parseInt(savedIndex, 10) : 0;
  const localIndex = localBudgets.length > 0
    ? Math.min(Math.max(0, parsedIndex), localBudgets.length - 1)
    : 0;
  const localState = { budgets: localBudgets, activeBudgetIndex: localIndex };

  if (isApiEnabled()) {
    try {
      const remoteState = await fetchBudgetState();
      if (remoteState?.budgets?.length > 0) {
        return remoteState;
      }
      if (localBudgets.length > 0) {
        await syncBudgetState(localBudgets, localIndex);
        return localState;
      }
      return remoteState ?? localState;
    } catch (error) {
      console.warn('Failed to load budgets from API, falling back to local storage:', error.message);
    }
  }

  return localState;
}

export function BudgetProvider({ children }) {
  const [budgets, setBudgetsState] = useState([]);
  const [activeBudgetIndex, setActiveBudgetIndexState] = useState(0);
  const [isLoadingBudget, setIsLoadingBudget] = useState(true);
  const [needsBudgetSetup, setNeedsBudgetSetup] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const activeBudgetIndexRef = useRef(0);

  const persistBudgets = useCallback(async (nextBudgets, nextIndex = activeBudgetIndex) => {
    await Promise.all([
      AsyncStorage.setItem(BUDGETS_STORAGE_KEY, serializeBudgets(nextBudgets)),
      AsyncStorage.setItem(ACTIVE_BUDGET_INDEX_KEY, String(nextIndex)),
    ]);

    if (isApiEnabled()) {
      try {
        await syncBudgetState(nextBudgets, nextIndex);
        setSyncError(null);
      } catch (error) {
        console.warn('Failed to sync budgets to API:', error.message);
        setSyncError(error.message);
      }
    }
  }, [activeBudgetIndex]);

  const updateBudgets = useCallback((updater, nextIndex) => {
    setBudgetsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const index = nextIndex ?? activeBudgetIndexRef.current;
      persistBudgets(next, index);
      return next;
    });
  }, [persistBudgets]);

  useEffect(() => {
    loadBudgetState().then(({ budgets: loadedBudgets, activeBudgetIndex: safeIndex }) => {
      setBudgetsState(loadedBudgets);
      setActiveBudgetIndexState(safeIndex);
      activeBudgetIndexRef.current = safeIndex;
      setNeedsBudgetSetup(loadedBudgets.length === 0);
      setIsLoadingBudget(false);

      if (loadedBudgets.length > 0) {
        persistBudgets(loadedBudgets, safeIndex);
      }
    });
  }, []);

  const setActiveBudgetIndex = useCallback((index) => {
    const clamped = budgets.length > 0
      ? Math.max(0, Math.min(index, budgets.length - 1))
      : 0;
    setActiveBudgetIndexState(clamped);
    activeBudgetIndexRef.current = clamped;
    AsyncStorage.setItem(ACTIVE_BUDGET_INDEX_KEY, String(clamped));
  }, [budgets.length]);

  const activeBudget = budgets[activeBudgetIndex] ?? null;

  useEffect(() => {
    activeBudgetIndexRef.current = activeBudgetIndex;
  }, [activeBudgetIndex]);

  const activeMetrics = useMemo(() => getBudgetMetrics(activeBudget), [activeBudget]);

  const setBudgetSetup = useCallback(async (amount, selectedTimeframe, name) => {
    if (!isValidBudgetName(name)) return;
    const now = new Date().toISOString();
    const newBudget = createBudget({
      amount,
      timeframe: selectedTimeframe,
      name: name.trim(),
      periodStartDate: now,
    });
    setBudgetsState([newBudget]);
    setActiveBudgetIndexState(0);
    setNeedsBudgetSetup(false);
    await persistBudgets([newBudget], 0);
  }, [persistBudgets]);

  const addBudget = useCallback(async (amount, selectedTimeframe, name) => {
    if (!isValidBudgetName(name)) return null;
    const now = new Date().toISOString();
    const newBudget = createBudget({
      amount,
      timeframe: selectedTimeframe,
      name: name.trim(),
      periodStartDate: now,
    });
    setBudgetsState((prev) => {
      const next = [...prev, newBudget];
      const nextIndex = next.length - 1;
      setActiveBudgetIndexState(nextIndex);
      persistBudgets(next, nextIndex);
      return next;
    });
    setNeedsBudgetSetup(false);
    return newBudget;
  }, [persistBudgets]);

  const updateActiveBudget = useCallback((patch) => {
    if (!activeBudget) return;
    updateBudgets((prev) =>
      prev.map((b, i) => (i === activeBudgetIndex ? { ...b, ...patch } : b)),
    );
  }, [activeBudget, activeBudgetIndex, updateBudgets]);

  const updateBudget = useCallback(async (amount) => {
    if (isNaN(amount) || amount <= 0) return;
    updateActiveBudget({ amount });
  }, [updateActiveBudget]);

  const updateBudgetName = useCallback(async (name) => {
    if (!isValidBudgetName(name)) return;
    updateActiveBudget({ name: name.trim() });
  }, [updateActiveBudget]);

  const updateTimeframe = useCallback(async (selectedTimeframe) => {
    if (!isValidTimeframe(selectedTimeframe)) return;
    updateActiveBudget({
      timeframe: selectedTimeframe,
      periodStartDate: new Date().toISOString(),
    });
  }, [updateActiveBudget]);

  const updateBudgetById = useCallback((budgetId, patch) => {
    if (patch.name !== undefined && !isValidBudgetName(patch.name)) return;
    updateBudgets((prev) =>
      prev.map((b) => (b.id === budgetId ? { ...b, ...patch, name: patch.name?.trim() ?? b.name } : b)),
    );
  }, [updateBudgets]);

  const addTransaction = useCallback((transaction) => {
    const indexAtCall = activeBudgetIndexRef.current;
    setIsAnimating(true);
    setPendingTransaction(transaction);

    setTimeout(() => {
      updateBudgets((prev) =>
        prev.map((b, i) =>
          i === indexAtCall
            ? { ...b, transactions: [transaction, ...(b.transactions || [])] }
            : b,
        ),
        indexAtCall,
      );
      setPendingTransaction(null);
      setIsAnimating(false);
    }, 2000);
  }, [updateBudgets]);

  const simulateBankNotification = useCallback(() => {
    const randomAmount = Math.floor(Math.random() * 40) + 1;
    const newTx = {
      id: Date.now().toString(),
      merchant: 'Coffee Corner',
      category: 'coffee',
      amount: randomAmount,
      date: new Date(),
      icon: 'local-cafe',
      color: '#8B6914',
    };
    addTransaction(newTx);
    return newTx;
  }, [addTransaction]);

  const budget = activeBudget?.amount ?? 0;
  const budgetName = activeBudget?.name ?? '';
  const timeframe = activeBudget?.timeframe ?? null;
  const periodStartDate = activeBudget?.periodStartDate ?? null;
  const transactions = activeBudget?.transactions ?? [];

  return (
    <BudgetContext.Provider value={{
      budgets,
      activeBudgetIndex,
      activeBudget,
      setActiveBudgetIndex,
      budget,
      budgetName,
      timeframe,
      periodStartDate,
      isLoadingBudget,
      needsBudgetSetup,
      syncError,
      isApiEnabled: isApiEnabled(),
      setBudgetSetup,
      addBudget,
      updateBudget,
      updateBudgetName,
      updateBudgetById,
      updateTimeframe,
      spent: activeMetrics.spent,
      remaining: activeMetrics.remaining,
      percentRemaining: activeMetrics.percentRemaining,
      onTrackProgress: activeMetrics.onTrackProgress,
      daysRemaining: activeMetrics.daysRemaining,
      totalDays: activeMetrics.totalDays,
      getBudgetMetrics,
      transactions,
      pendingTransaction,
      isAnimating,
      addTransaction,
      simulateBankNotification,
    }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  return useContext(BudgetContext);
}

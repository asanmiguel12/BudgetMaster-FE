import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BudgetContext = createContext();

const BUDGET_STORAGE_KEY = '@mybudget/budget';
const TIMEFRAME_STORAGE_KEY = '@mybudget/timeframe';

export const TIME_UNITS = {
  days: { label: 'Days', singular: 'day', max: 31 },
  weeks: { label: 'Weeks', singular: 'week', max: 52 },
  months: { label: 'Months', singular: 'month', max: 12 },
  years: { label: 'Years', singular: 'year', max: 10 },
};

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

const INITIAL_TRANSACTIONS = [];

export function BudgetProvider({ children }) {
  const [budget, setBudgetState] = useState(0);
  const [timeframe, setTimeframeState] = useState(null);
  const [isLoadingBudget, setIsLoadingBudget] = useState(true);
  const [needsBudgetSetup, setNeedsBudgetSetup] = useState(false);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(BUDGET_STORAGE_KEY),
      AsyncStorage.getItem(TIMEFRAME_STORAGE_KEY),
    ]).then(([savedBudget, savedTimeframe]) => {
      let hasBudget = false;
      let hasTimeframe = false;

      if (savedBudget !== null) {
        const parsed = parseFloat(savedBudget);
        if (!isNaN(parsed) && parsed > 0) {
          setBudgetState(parsed);
          hasBudget = true;
        }
      }

      const parsedTimeframe = parseTimeframe(savedTimeframe);
      if (isValidTimeframe(parsedTimeframe)) {
        setTimeframeState(parsedTimeframe);
        hasTimeframe = true;
      }

      setNeedsBudgetSetup(!hasBudget || !hasTimeframe);
      setIsLoadingBudget(false);
    });
  }, []);

  const setBudgetSetup = useCallback(async (amount, selectedTimeframe) => {
    setBudgetState(amount);
    setTimeframeState(selectedTimeframe);
    setNeedsBudgetSetup(false);
    await Promise.all([
      AsyncStorage.setItem(BUDGET_STORAGE_KEY, String(amount)),
      AsyncStorage.setItem(TIMEFRAME_STORAGE_KEY, JSON.stringify(selectedTimeframe)),
    ]);
  }, []);

  const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = budget - spent;
  const percentRemaining = budget > 0 ? ((remaining / budget) * 100).toFixed(2) : '0.00';

  const addTransaction = useCallback((transaction) => {
    setIsAnimating(true);
    setPendingTransaction(transaction);

    setTimeout(() => {
      setTransactions(prev => [transaction, ...prev]);
      setPendingTransaction(null);
      setIsAnimating(false);
    }, 2000);
  }, []);

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

  return (
    <BudgetContext.Provider value={{
      budget,
      timeframe,
      isLoadingBudget,
      needsBudgetSetup,
      setBudgetSetup,
      spent,
      remaining,
      percentRemaining,
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

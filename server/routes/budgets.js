const express = require('express');
const { getUserState, setUserState } = require('../store');

const router = express.Router();

function getUserId(req) {
  return req.headers['x-user-id'] || 'demo';
}

function clampActiveIndex(budgets, index) {
  if (budgets.length === 0) return 0;
  return Math.max(0, Math.min(index, budgets.length - 1));
}

router.get('/', (req, res) => {
  const state = getUserState(getUserId(req));
  res.json({
    budgets: state.budgets,
    activeBudgetIndex: clampActiveIndex(state.budgets, state.activeBudgetIndex),
  });
});

router.put('/sync', (req, res) => {
  const { budgets, activeBudgetIndex } = req.body ?? {};
  if (!Array.isArray(budgets)) {
    return res.status(400).json({ error: 'budgets must be an array' });
  }

  const nextState = setUserState(getUserId(req), {
    budgets,
    activeBudgetIndex: clampActiveIndex(budgets, activeBudgetIndex ?? 0),
  });

  res.json(nextState);
});

router.post('/', (req, res) => {
  const { budget } = req.body ?? {};
  if (!budget?.id) {
    return res.status(400).json({ error: 'budget with id is required' });
  }

  const userId = getUserId(req);
  const state = getUserState(userId);
  const nextBudgets = [...state.budgets, budget];
  const nextState = setUserState(userId, {
    budgets: nextBudgets,
    activeBudgetIndex: nextBudgets.length - 1,
  });

  res.status(201).json(nextState);
});

router.patch('/:id', (req, res) => {
  const userId = getUserId(req);
  const state = getUserState(userId);
  const index = state.budgets.findIndex((b) => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'budget not found' });
  }

  const nextBudgets = state.budgets.map((b, i) =>
    i === index ? { ...b, ...req.body, id: b.id } : b,
  );

  const nextState = setUserState(userId, {
    budgets: nextBudgets,
    activeBudgetIndex: state.activeBudgetIndex,
  });

  res.json(nextState);
});

router.delete('/:id', (req, res) => {
  const userId = getUserId(req);
  const state = getUserState(userId);
  const nextBudgets = state.budgets.filter((b) => b.id !== req.params.id);
  const nextState = setUserState(userId, {
    budgets: nextBudgets,
    activeBudgetIndex: clampActiveIndex(nextBudgets, state.activeBudgetIndex),
  });

  res.json(nextState);
});

router.post('/:id/transactions', (req, res) => {
  const { transaction } = req.body ?? {};
  if (!transaction?.id) {
    return res.status(400).json({ error: 'transaction with id is required' });
  }

  const userId = getUserId(req);
  const state = getUserState(userId);
  const index = state.budgets.findIndex((b) => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'budget not found' });
  }

  const nextBudgets = state.budgets.map((b, i) =>
    i === index
      ? { ...b, transactions: [transaction, ...(b.transactions || [])] }
      : b,
  );

  const nextState = setUserState(userId, {
    budgets: nextBudgets,
    activeBudgetIndex: state.activeBudgetIndex,
  });

  res.status(201).json(nextState);
});

module.exports = router;

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'budgets.json');

const DEFAULT_STATE = {
  budgets: [],
  activeBudgetIndex: 0,
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
  }
}

function readAllUsers() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAllUsers(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getUserState(userId) {
  const all = readAllUsers();
  return all[userId] ?? { ...DEFAULT_STATE };
}

function setUserState(userId, state) {
  const all = readAllUsers();
  all[userId] = {
    budgets: Array.isArray(state.budgets) ? state.budgets : [],
    activeBudgetIndex: Number.isInteger(state.activeBudgetIndex) ? state.activeBudgetIndex : 0,
  };
  writeAllUsers(all);
  return all[userId];
}

module.exports = {
  getUserState,
  setUserState,
};

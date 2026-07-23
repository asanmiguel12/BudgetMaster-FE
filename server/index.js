const express = require('express');
const cors = require('cors');
const budgetsRouter = require('./routes/budgets');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/budgets', budgetsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

app.listen(PORT, () => {
  console.log(`Budget Master API listening on http://localhost:${PORT}`);
});

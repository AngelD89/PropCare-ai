require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ──
// Allow requests from GitHub Pages frontend and local dev
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://angeld89.github.io',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ── BODY PARSING ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── HEALTH CHECK ──
app.get('/', (req, res) => {
  res.json({
    status: 'PropCare AI Backend is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// ── ROUTES ──
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/bookings',   require('./routes/bookings'));
app.use('/api/contacts',   require('./routes/contacts'));
app.use('/api/ai',         require('./routes/ai'));

// ── 404 HANDLER ──
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── START SERVER ──
app.listen(PORT, () => {
  console.log(`\n🏠 PropCare AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 Accepting requests from: ${allowedOrigins.join(', ')}`);
  console.log(`🔑 Anthropic key: ${process.env.ANTHROPIC_API_KEY ? 'configured ✓' : 'MISSING ✗'}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'configured ✓' : 'MISSING ✗'}\n`);
});

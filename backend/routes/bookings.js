const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
router.use(auth);
router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM bookings WHERE user_id = $1 ORDER BY date ASC', [req.userId]);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});
router.post('/', async (req, res) => {
  try {
    const { service, provider, property, date, time, notes } = req.body;
    if (!service || !date) return res.status(400).json({ error: 'Service and date required' });
    const r = await db.query('INSERT INTO bookings (service, provider, property, date, time, notes, status, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *', [service, provider||'', property||'', date, time||'09:00 AM', notes||'', 'pending', req.userId]);
    res.status(201).json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed' }); }
});
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM bookings WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ message: 'Cancelled' });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});
module.exports = router;
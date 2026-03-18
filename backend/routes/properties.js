const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
router.use(auth);
router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM properties WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});
router.post('/', async (req, res) => {
  try {
    const { name, address, type, beds, status, emoji, notes, tags } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const r = await db.query('INSERT INTO properties (name, address, type, beds, status, emoji, notes, tags, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *', [name, address||'', type||'Airbnb', beds||1, status||'active', emoji||'🏠', notes||'', JSON.stringify(tags||[]), req.userId]);
    res.status(201).json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed' }); }
});
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM properties WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});
module.exports = router;
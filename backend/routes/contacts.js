const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
router.use(auth);
router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM contacts WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});
router.post('/', async (req, res) => {
  try {
    const { name, type, phone, website, emoji } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
    const r = await db.query('INSERT INTO contacts (name, type, phone, website, emoji, rating, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [name, type||'General', phone, website||null, emoji||'🔧', 5.0, req.userId]);
    res.status(201).json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed' }); }
});
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM contacts WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    res.json({ message: 'Removed' });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});
module.exports = router;
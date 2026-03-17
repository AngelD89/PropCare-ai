const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

router.use(auth);

// ── GET ALL CONTACTS ──
router.get('/', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// ── CREATE CONTACT ──
router.post('/', async (req, res) => {
  try {
    const { name, type, phone, website, rating, emoji } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        type: type || 'General',
        phone,
        website: website || null,
        rating: rating ? parseFloat(rating) : 5.0,
        emoji: emoji || '🔧',
        userId: req.userId,
      },
    });
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// ── DELETE CONTACT ──
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.contact.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Contact not found' });

    await prisma.contact.delete({ where: { id: req.params.id } });
    res.json({ message: 'Contact removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;

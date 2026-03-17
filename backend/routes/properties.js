const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

// All routes require auth
router.use(auth);

// ── GET ALL PROPERTIES FOR USER ──
router.get('/', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// ── GET SINGLE PROPERTY ──
router.get('/:id', async (req, res) => {
  try {
    const property = await prisma.property.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { bookings: { orderBy: { createdAt: 'desc' } } },
    });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// ── CREATE PROPERTY ──
router.post('/', async (req, res) => {
  try {
    const {
      name, address, city, state, type, beds,
      sqft, built, status, emoji, notes, tags
    } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }

    const property = await prisma.property.create({
      data: {
        name,
        address,
        city: city || 'San Juan',
        state: state || 'PR',
        type: type || 'Airbnb',
        beds: parseInt(beds) || 1,
        sqft: sqft ? parseInt(sqft) : null,
        built: built ? parseInt(built) : null,
        status: status || 'active',
        emoji: emoji || '🏠',
        notes: notes || '',
        tags: tags || [],
        userId: req.userId,
      },
    });

    res.status(201).json(property);
  } catch (err) {
    console.error('Create property error:', err);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// ── UPDATE PROPERTY ──
router.put('/:id', async (req, res) => {
  try {
    // Make sure property belongs to user
    const existing = await prisma.property.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Property not found' });

    const updated = await prisma.property.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// ── DELETE PROPERTY ──
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.property.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Property not found' });

    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

module.exports = router;

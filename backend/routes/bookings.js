const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const prisma = new PrismaClient();

router.use(auth);

// ── GET ALL BOOKINGS FOR USER ──
router.get('/', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'asc' },
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// ── CREATE BOOKING ──
router.post('/', async (req, res) => {
  try {
    const { service, provider, property, date, time, notes, propertyId } = req.body;

    if (!service || !date) {
      return res.status(400).json({ error: 'Service and date are required' });
    }

    const booking = await prisma.booking.create({
      data: {
        service,
        provider: provider || 'TBD',
        property: property || '',
        date,
        time: time || '09:00 AM',
        status: 'pending',
        notes: notes || '',
        userId: req.userId,
        propertyId: propertyId || null,
      },
    });

    // Increment serviceCount on property if linked
    if (propertyId) {
      await prisma.property.updateMany({
        where: { id: propertyId, userId: req.userId },
        data: { serviceCount: { increment: 1 } },
      });
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// ── UPDATE BOOKING STATUS ──
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Booking not found' });

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// ── DELETE / CANCEL BOOKING ──
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Booking not found' });

    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;

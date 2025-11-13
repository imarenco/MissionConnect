import express from 'express';
import mongoose from 'mongoose';
import { Contact, Note, Visit } from '../models/index.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const DEMO_ADMIN_ID = new mongoose.Types.ObjectId('64b5d5e6f0c2f1b2a3c4d5e6');

const DEMO_CONTACTS = [
  { firstName: 'Joseph', lastName:'Smith', phone:'(555)123-4567', address:'Salt Lake City, UT', status:'interested', tags:['english'] , lat:40.7608, lng:-111.8910},
  { firstName: 'Maria', lastName:'Garcia', phone:'(555)234-5678', address:'Provo, UT', status:'teaching', tags:['spanish'], lat:40.2338, lng:-111.6585}
];

router.post('/init', auth, async (req, res) => {
  try {
    if (!req.user?.isDemo) return res.status(403).json({ error: 'Only demo admin' });
    const existing = await Contact.find({ owner: DEMO_ADMIN_ID });
    if (existing.length) return res.json({ message: 'Demo exists', contactCount: existing.length });
    const created = [];
    for (const c of DEMO_CONTACTS) {
      const newC = await Contact.create({ ...c, owner: DEMO_ADMIN_ID });
      created.push(newC);
    }
    await Note.create({ contact: created[0]._id, author: DEMO_ADMIN_ID, text: 'Demo note 1' });
    await Visit.create({ contact: created[0]._id, user: DEMO_ADMIN_ID, datetime: new Date(Date.now()+86400000), notes: 'Demo visit' });
    res.json({ message: 'Demo init', contactCount: created.length });
  } catch (err) {
    console.error('Demo init error', err);
    res.status(500).json({ error: 'Failed' });
  }
});

router.delete('/clear', auth, async (req, res) => {
  try {
    if (!req.user?.isDemo) return res.status(403).json({ error: 'Only demo admin' });
    await Contact.deleteMany({ owner: DEMO_ADMIN_ID });
    await Note.deleteMany({ author: DEMO_ADMIN_ID });
    await Visit.deleteMany({ user: DEMO_ADMIN_ID });
    res.json({ message: 'Demo cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;

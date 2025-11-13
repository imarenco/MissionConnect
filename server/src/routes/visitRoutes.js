import express from 'express';
import { createVisit, getVisits } from '../controllers/visitController.js';
import { protect } from '../middleware/auth.js'; 

const router = express.Router();

// Protect these routes so only authenticated users can create/list their visits
router.post('/', protect, createVisit);
router.get('/', protect, getVisits);

export default router;

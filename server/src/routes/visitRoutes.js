import express from 'express';
import { createVisit, getVisits, getVisitById, updateVisit, deleteVisit } from '../controllers/visitController.js';
import { protect } from '../middleware/auth.js'; 

const router = express.Router();

// Protect these routes so only authenticated users can create/list their visits
router.post('/', protect, createVisit);
router.get('/', protect, getVisits);
router.get('/:id', protect, getVisitById);
router.put('/:id', protect, updateVisit);
router.delete('/:id', protect, deleteVisit);

export default router;

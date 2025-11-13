// server/src/routes/contactRoutes.js
import express from "express";
import { getContacts, getContactById, createContact } from "../controllers/contactController.js";
import { protect } from "../middleware/auth.js"; // adjust if your auth middleware file name differs

const router = express.Router();

// List + create
router.get("/", protect, getContacts);
router.post("/", protect, createContact);

// Single contact
router.get("/:id", protect, getContactById);

export default router;

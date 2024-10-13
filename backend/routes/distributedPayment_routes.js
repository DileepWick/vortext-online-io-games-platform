import express from "express";
import { saveDistributedPayment,
    getAllDistributedPayments,
 } 
from "../controllers/distributedPayment_controller.js";

const router = express.Router();

// POST route to save distributed payment
router.post("/save", saveDistributedPayment);
router.get("/all", getAllDistributedPayments);

export default router;

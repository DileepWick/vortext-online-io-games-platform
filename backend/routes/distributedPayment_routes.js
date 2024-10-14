import express from "express";
import { saveDistributedPayment,
    getAllDistributedPayments,
    getAllDistributedPaymentsForDeveloper
 } 
from "../controllers/distributedPayment_controller.js";

const router = express.Router();

// POST route to save distributed payment
router.post("/save", saveDistributedPayment);
router.get("/all", getAllDistributedPayments);
router.get("/:developerId",getAllDistributedPaymentsForDeveloper);

export default router;

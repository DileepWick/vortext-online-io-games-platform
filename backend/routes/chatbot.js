import express from "express";
import { FAQ } from "../models/faq.js"; // Import the FAQ model

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const userQuestion = req.body.question;
    const faq = await FAQ.findOne({ question: new RegExp(userQuestion, "i") });

    if (faq) {
      res.json({ answer: faq.answer });
    } else {
      res.json({ answer: "Sorry, I don’t have the answer to that question." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
});

export default router;

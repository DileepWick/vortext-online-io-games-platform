import mongoose from "mongoose";

const { Schema } = mongoose; // Destructure Schema from mongoose

const FAQSchema = Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

export const FAQ = mongoose.model("FAQ", FAQSchema);

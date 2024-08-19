import mongoose from "mongoose";

const { Schema } = mongoose;

const questionSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  hint: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  }
}, { _id: false });

const quizEditionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assumes there is a 'User' model
    required: true
  }
});

export const QuizEdition = mongoose.model("QuizEdition", quizEditionSchema);

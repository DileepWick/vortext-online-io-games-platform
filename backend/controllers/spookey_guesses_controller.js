// controllers/quizController.js
import {QuizEdition} from '../models/spookey_guesses_editon.js'
import { User } from '../models/user.js';

// Create a new quiz edition
export const createQuizEdition = async (req, res) => {
  try {
    const { title, questions, creator } = req.body;

    // Check if the creator exists
    const user = await User.findById(creator);
    if (!user) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    const newQuiz = new QuizEdition({
      title,
      questions,
      creator
    });

    const savedQuiz = await newQuiz.save();
    res.status(200).json({ message: 'Quiz edition added successfully!', data: savedQuiz });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add quiz edition', error: error.message });
  }
};

// Get all quiz editions
export const getAllQuizEditions = async (req, res) => {
  try {
    const quizzes = await QuizEdition.find().populate('creator', 'username'); // Populate creator info
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve quizzes', error: error.message });
  }
};

// Get questions of a single quiz edition by ID
export const getQuizQuestionsByEditionId = async (req, res) => {
  try {
    const { id } = req.params;
    // Retrieve only the questions field for the given quiz edition ID
    const quiz = await QuizEdition.findById(id).select('questions');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz edition not found' });
    }
    res.status(200).json(quiz.questions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve quiz questions', error: error.message });
  }
};

// Get title of the editon by id
export const getEditonTitleById = async (req, res) => {
  try {
    const { id } = req.params;
    // Retrieve only the questions field for the given quiz edition ID
    const quiz = await QuizEdition.findById(id).select('title');
    if (!quiz) {
      return res.status(404).json({ message: 'Edition not found' });
    }
    res.status(200).json(quiz.title);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve edition title', error: error.message });
  }
};



// Update a quiz edition by ID
export const updateQuizEdition = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, questions } = req.body;

    const updatedQuiz = await QuizEdition.findByIdAndUpdate(id, { title, questions }, { new: true });
    if (!updatedQuiz) {
      return res.status(404).json({ message: 'Quiz edition not found' });
    }
    res.status(200).json({ message: 'Quiz edition updated successfully!', data: updatedQuiz });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update quiz edition', error: error.message });
  }
};

// Delete a quiz edition by ID
export const deleteQuizEdition = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuiz = await QuizEdition.findByIdAndDelete(id);
    if (!deletedQuiz) {
      return res.status(404).json({ message: 'Quiz edition not found' });
    }
    res.status(200).json({ message: 'Quiz edition deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete quiz edition', error: error.message });
  }
};

// routes/quizRoutes.js
import express from 'express';
const spookeyRouter = express.Router();
import { createQuizEdition, getAllQuizEditions, getQuizQuestionsByEditionId, updateQuizEdition, deleteQuizEdition ,getEditonTitleById} from '../controllers/spookey_guesses_controller.js';

// Create a new quiz edition
spookeyRouter.post('/addNewEdition', createQuizEdition);

// Get all quiz editions
spookeyRouter.get('/', getAllQuizEditions);

// Get a single quiz edition by ID
spookeyRouter.get('/:id', getQuizQuestionsByEditionId);

//Get title by edition title
spookeyRouter.get('/getEditionTitle/:id',getEditonTitleById);

// Update a quiz edition by ID
spookeyRouter.put('/updateEdition/:id', updateQuizEdition);

// Delete a quiz edition by ID
spookeyRouter.delete('/deleteEdition/:id', deleteQuizEdition);

export default spookeyRouter;

// routes/rock_paper_scissors_routes.js

import express from 'express';
import rockPaperScissorsController from '../controllers/rockPaperScissorsController.js';

const router = express.Router();

router.post('/play', rockPaperScissorsController.playGame);

export default router;
import express from 'express';
import { createRating, getRatings,updateRating } from '../controllers/ratingController.js';

const router = express.Router();

router.post('/', createRating);
router.get('/game/:gameId', getRatings);
router.put('/game/:ratingId', updateRating);

export default router;
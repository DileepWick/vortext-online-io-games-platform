import express from 'express';
import { createRating, getRatings,updateRating,getallRatings,deleteRatingbyId} from '../controllers/ratingController.js';

const router = express.Router();

router.post('/', createRating);
router.get('/game/:gameId', getRatings);
router.put('/game/:ratingId', updateRating);
router.get('/getallratings',getallRatings);
router.delete('/game/:ratingId',deleteRatingbyId);

export default router;
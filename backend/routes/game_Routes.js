import express from 'express';
import upload from '../middleware/multer.js';
import { uploadGame, getAllGames, deleteGame, updateGame ,addRatingPoints ,getSpecificGame,GamesShop} from '../controllers/gameController.js';

const gameRouter = express.Router();

//Main CRUDS
gameRouter.post('/uploadGame', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), uploadGame);
gameRouter.get('/allGames', getAllGames);
gameRouter.delete('/deleteGame/:id', deleteGame);
gameRouter.put('/updateGame/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), updateGame);

//Other functions
gameRouter.put('/RateGame/:id', addRatingPoints);
gameRouter.get('/allGames/selectedGame/:id',getSpecificGame);
gameRouter.get('/allGames/ShopGames',GamesShop);

export default gameRouter;
// routes/gameStockRouter.js

import express from 'express';
import {
  createGameStock,
  getAllGameStocks,
  getGameStockById,
  updateGameStock,
  deleteGameStock,
  restockUnits,
  addDiscount,
  getGameStocksByAssignedGameId
} from '../controllers/gameStockController.js';

const gameStockRouter = express.Router();

gameStockRouter.post('/createGameStock', createGameStock);
gameStockRouter.get('/allGameStock', getAllGameStocks);
gameStockRouter.get('/GetStockById/:id', getGameStockById);
gameStockRouter.put('/updateGameStock/:id', updateGameStock);
gameStockRouter.delete('/deleteGameStock/:id', deleteGameStock);
gameStockRouter.put('/restockGameStock/:id', restockUnits);
gameStockRouter.put('/addDiscountToStock/:id', addDiscount);
gameStockRouter.get('/getGameStockDetails/:id',getGameStocksByAssignedGameId);

export default gameStockRouter;

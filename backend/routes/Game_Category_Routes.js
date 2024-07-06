// routes/gameCategoryRouter.js

import express from "express";
import {
  uploadGameCategory,
  deleteGameCategory,
  updateGameCategory,
  getAllGameCategories,
} from "../controllers/gameCategoryController.js";

const gameCategoryRouter = express.Router();

//Main CRUDS
gameCategoryRouter.post("/uploadGameCategory", uploadGameCategory);
gameCategoryRouter.delete("/deleteGameCategory/:id", deleteGameCategory);
gameCategoryRouter.put("/updateGameCategory/:id", updateGameCategory);
gameCategoryRouter.get("/getAllGameCategories", getAllGameCategories);

export default gameCategoryRouter;


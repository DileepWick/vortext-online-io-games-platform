import {createPost} from "../controllers/communityPostController.js";
import express from "express";
import upload from "../middleware/multer.js";

const postRouter = express.Router();

//Main CRUD
postRouter.post('/create',upload.fields([{ name: "image", maxCount: 1 }]), createPost);


export default postRouter;
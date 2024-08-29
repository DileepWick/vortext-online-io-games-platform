import express from "express";
import {
  createArticle,
  getBloggerArticles,
  getAllArticles,
  toggleLike,
  addComment,
  deleteArticle,
  deleteComment
} from "../controllers/article_controller.js";
import upload from "../middleware/multer.js";

const articleRouter = express.Router();

articleRouter.post(
  "/createNewArticle",
  upload.fields([{ name: "image", maxCount: 1 }]),
  createArticle
);
articleRouter.get("/myArticles/:uploaderid", getBloggerArticles);
articleRouter.get('/getAllArticles', getAllArticles);
articleRouter.put('/toggleLike/:articleId', toggleLike);
articleRouter.post('/:articleId/comments', addComment);
articleRouter.delete('/deleteArticle/:articleId', deleteArticle); // Delete article
articleRouter.delete('/deleteComment/:articleId/:commentId', deleteComment);

export default articleRouter;

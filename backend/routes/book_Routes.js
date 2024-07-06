import express from "express";
import { Book } from "../models/bookModel.js";


//Router
const bookRouter = express.Router();


// Add new book route with user ID parameter
bookRouter.post("/addNewBook", async (req, res) => {
  try {

    // Check if all required fields are present in the request body
    if (!req.body.title || !req.body.publishYear) {
      return res.status(400).json({ message: "Title and Publish Year are required" });
    }

    // Create a new book object from the request body
    const newBook = {
      title: req.body.title,
      author: req.body.author,
      publishYear:req.body.publishYear,
    };

    // Create a new book record in the database using the Book model
    const book = await Book.create(newBook);

    // If book creation is successful, send a success response
    return res.status(201).json({
      message: "Book Added Successfully!",
      book,
    });
  } catch (error) {
    console.error("Error adding book:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

//Get all books
bookRouter.get("/allBooks", async (request, response) => {
  try {
    const allBooks = await Book.find().populate('author');
    return response.status(200).json({
      total_books: allBooks.length,
      allBooks: allBooks,
    });
  } catch (erro) {
    console.log(erro.message);
  }
});

//Get sepecific book with id
bookRouter.get("/allBooks/FindById/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const sepecificBook = await Book.findById(id);

    return response.status(200).json(sepecificBook);
  } catch (erro) {
    console.log(erro.message);
  }
});

//Get books by author
bookRouter.get("/allBooks/FindByAuthor/:authorId", async (request, response) => {
  try {
    const { authorId } = request.params;

    // Find books where 'author' matches the provided authorId
    const specificBooks = await Book.find({ author: authorId }).populate('author');
    // Check if any books are found
    if (specificBooks.length > 0) {
      return response.status(200).json({
        TotalBooks: specificBooks.length,
        AssignedBooks: specificBooks,
      });
    } else {
      return response
        .status(404)
        .json({ message: "No books found with the specified Author." });
    }
  } catch (error) {
    console.error(error.message);
    return response.status(500).json({ message: "Internal server error" });
  }
});

//Updating a book
bookRouter.put("/allBooks/UpdateBook/:id", async (request, response) => {
  try {
    // Check if all required fields are present in the request body
    if (
      !request.body.title ||
      !request.body.author ||
      !request.body.publishYear
    ) {
      // If any required field is missing, send a response with an error message
      return response.send({
        message: "Requires all fields",
      });
    }

    
    const { id } = request.params;

    const result = await Book.findByIdAndUpdate(id, request.body);

    if (!result) {
      return response.send({
        message: "Book not found",
      });
    }

    return response.send({
      message: "Book updated successfully!",
    });
  } catch (error) {}
});

//Delete a book
bookRouter.delete("/allBooks/DeleteBook/:id", async (request, response) => {
  try {
    const { id } = request.params;

    const result = await Book.findByIdAndDelete(id);

    if (!result) {
      return response.send({
        message: "Book not found",
      });
    }

    return response.send({
      message: "Book deleted successfully!",
      result:result,
    });
  } catch (error) {}
});

//Return bookRouter that holds all the routes for books
export default bookRouter;

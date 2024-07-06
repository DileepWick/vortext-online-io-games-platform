import mongoose from "mongoose";

const { Schema } = mongoose; // Destructure Schema from mongoose

const bookSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (make sure it matches your User model name)
    required: true,
  },
  publishYear: {
    type: Number,
    required: true,
  },
});

export const Book = mongoose.model("Book", bookSchema);

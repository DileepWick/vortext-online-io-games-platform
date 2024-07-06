import axios from "axios";
import React, { useState, useEffect } from "react";

//Components
import Header from "../components/header";
import ConfirmBox from "../components/confirmationBox";
import myImage from "../assets/appok.gif";
import PopupBox from "../components/PopUpBox";
import { getUserIdFromToken } from "../utils/user_id_decoder";

//Utils
import useAuthCheck from "../utils/authCheck";
import { getToken } from "../utils/getToken";

const ManageBooks = () => {
  //Authenticate user
  useAuthCheck();



  // Books states
  const [allBooks, setAllBooks] = useState([]);

  //Update book states
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for managing confirmation box
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [bookIdToDelete, setBookIdToDelete] = useState(null);

  // State for popups
  const [popUpMessage, setPopUpMessage] = useState("");

  // Hook to receive all books dynamically when something changes
  useEffect(() => {
    // Function to get all books
    const getAllBooks = async () => {
      try {
        const token = getToken();
        const author = getUserIdFromToken(token);
        const books = await axios.get(`http://localhost:8098/books/allBooks/FindByAuthor/${author}`);
         

        if (books.data.AssignedBooks) {
          setAllBooks(books.data.AssignedBooks);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    // Call the function
    getAllBooks();
  }, []);

  // Function 01 - Handle Delete
  const handleDelete = async (bookId) => {
    try {
      const DeleteResult = await axios.delete(
        `http://localhost:8098/books/allBooks/DeleteBook/${bookId}`
      );
      if (DeleteResult.data.message) {
        setAllBooks(allBooks.filter((book) => book._id !== bookId));
        setPopUpMessage(DeleteResult.data.message);
      }
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  // Function 02 - Handle delete button click
  const handleDeleteClick = (bookId) => {
    setBookIdToDelete(bookId);
    setShowConfirmBox(true);
  };

  // Function 03 - Handle confirmation result
  const handleConfirmation = (result) => {
    setShowConfirmBox(false);
    if (result && bookIdToDelete) {
      handleDelete(bookIdToDelete);
    }
    setBookIdToDelete(null);
  };

  // Function 04 - Handle popup close
  const handlePopupClose = () => {
    setPopUpMessage("");
  };

  // Function 05 - Handle update button click
  const handleUpdateClick = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  // Function 06 - Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Function 07 - Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Update book logic
    try {
      const UpdateResult = await axios.put(
        `http://localhost:8098/books/allBooks/UpdateBook/${selectedBook._id}`,
        selectedBook
      );
      if (UpdateResult.data.message) {
        setPopUpMessage(UpdateResult.data.message);
        // Update the book in the books array with the new data
        setAllBooks(
          allBooks.map((book) =>
            book._id === selectedBook._id ? selectedBook : book
          )
        );
      }
    } catch (error) {
      console.error("Error deleting book:", error);
    }
    closeModal();
  };

  // Function 08 - Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedBook({ ...selectedBook, [name]: value });
  };

  return (
    <div>
      <Header />
      {/* If pop up message is set . Pop up box will also set */}
      {popUpMessage && (
        <PopupBox
          message={popUpMessage}
          imageUrl={myImage}
          onClose={handlePopupClose}
        />
      )}
      <div className="p-4">
        <table className="min-w-full bg-white border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Title
              </th>
              <th className="border px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Author
              </th>
              <th className="border px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Publish Year
              </th>
              <th className="border px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {allBooks.map((book) => (
              <tr key={book._id} className="hover:bg-gray-100">
                <td className="border px-6 py-4 text-gray-700">{book.title}</td>
                <td className="border px-6 py-4 text-gray-700">
                  {book.author.username}
                </td>
                <td className="border px-6 py-4 text-gray-700">
                  {book.publishYear}
                </td>
                <td className="border px-6 py-4 text-gray-700">
                  <button
                    onClick={() => handleUpdateClick(book)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteClick(book._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/*Delete Confirmation */}
        {showConfirmBox && (
          <ConfirmBox
            message="Are you sure you want to delete this book?"
            imageUrl={myImage}
            onConfirm={handleConfirmation}
            onClose={() => setShowConfirmBox(false)}
          />
        )}

        {/*Update Popup */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative z-40 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Book Details</h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600">
                    Title:
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={selectedBook?.title}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600">
                    Publish Year:
                  </label>
                  <input
                    type="number"
                    name="publishYear"
                    value={selectedBook?.publishYear}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-md"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
            <div className="fixed inset-0 bg-black opacity-50 z-30"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBooks;

import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

//Components
import PopupBox from "../components/PopUpBox";
import Header from "../components/header";

//Assets
import myImage from "../assets/appok.gif";

//Utils
import { getUserIdFromToken } from "../utils/user_id_decoder";
import useAuthCheck from "../utils/authCheck";
import { getToken } from "../utils/getToken";

// Create book component
const CreateBook = () => {
  // Authenticate user
  useAuthCheck();

  // State for alert message
  const [message, setMessage] = React.useState("");

  // Formik initial values and validation schema
  const formik = useFormik({
    initialValues: {
      title: "",
      publishYear: "",
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required("Title is required")
        .min(2, "Title must be at least 2 characters"),
      publishYear: Yup.number()
        .required("Publish year is required")
        .min(1000, "Publish year must be at least 1000")
        .max(new Date().getFullYear(), `Publish year can't be in the future`),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const token = getToken(); //Get token
        const author = getUserIdFromToken(token); //Use token to get user id

        const newBook = {
          title: values.title,
          author,
          publishYear: values.publishYear,
        };

        const response = await axios.post(
          "http://localhost:8098/books/addNewBook",
          newBook
        );

        if (response.data.message) {
          setMessage(response.data.message);
          resetForm();
        }
      } catch (error) {
        setMessage("Error creating a new book");
        resetForm();
      }
    },
  });

  // Handle popup close
  const handlePopupClose = () => {
    setMessage("");
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl mb-4">Add New Book</h2>

        {/* If message is set, Pop up box will also set */}
        {message && (
          <PopupBox
            message={message}
            imageUrl={myImage}
            onClose={handlePopupClose}
          />
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Title:
            </label>
            <input
              type="text"
              name="title"
              value={formik.values.title}
              placeholder="Enter title"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
              className="mt-1 p-2 w-full border rounded-md"
            />
            {formik.touched.title && formik.errors.title ? (
              <div className="text-red-500 text-sm">{formik.errors.title}</div>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Year:
            </label>
            <input
              type="number"
              name="publishYear"
              placeholder="Enter publish year"
              value={formik.values.publishYear}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
              className="mt-1 p-2 w-full border rounded-md"
            />
            {formik.touched.publishYear && formik.errors.publishYear ? (
              <div className="text-red-500 text-sm">
                {formik.errors.publishYear}
              </div>
            ) : null}
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBook;

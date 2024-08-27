export const submitContactForm = async (req, res) => {
  try {
    // Extract user ID from the request body
    const { userId, username, email, message } = req.body;

    // Validate input
    if (!username || !email || !message || message.trim() === "") {
      return res.status(400).json({
        message: "Username, email, and non-empty message are required",
      });
    }

    // Create new ContactUs object
    const newContact = new ContactUsSchema({
      userId,
      username,
      email,
      message,
    });

    // Save the contact in the database
    const createdContact = await newContact.save();

    // Send success response
    if (createdContact) {
      return res.status(201).json({
        message: "Contact form submitted successfully",
        contact: createdContact,
      });
    }
  } catch (error) {
    // Log error and send error response
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

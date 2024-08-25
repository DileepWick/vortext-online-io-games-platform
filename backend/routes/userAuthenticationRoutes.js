import express from "express";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { Cart } from "../models/cart.js";
import fs from "fs";
import cloudinary from "../utils/cloudinary.js";
import upload from "../middleware/multer.js";

// Router
const userRouter = express.Router();

// User Registration
userRouter.post("/register", async (request, response) => {
  try {
    const { firstname,lastname,username, password, email, birthday, role } = request.body;

    // Validate input
    if ( !firstname || !lastname || !username || !password || !email || !birthday) {
      return response.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return response.status(400).json({ message: "Username already exists" });
    }

    // Check if the email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return response.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate age from birthday
    const age = calculateAge(birthday);

    // Categorize player type based on age
    let playerType;
    if (age < 13) {
      playerType = "Kid";
    } else if (age >= 13 && age < 18) {
      playerType = "Teenager";
    } else {
      playerType = "Adult";
    }

    // Assign the role (either provided or default to 'user')
    const assignedRole = role || "user";

    // Prepare new user object
    const newUser = {
      firstname,
      lastname,
      username,
      password: hashedPassword,
      role: assignedRole,
      email,
      birthday,
      age, // Store the calculated age
      playerType, // Store the categorized player type
    };

    // Create a new user
    const createdUser = await User.create(newUser);

    // Create a cart for the user (if applicable, assuming all users need a cart)
    const newCart = { owner: createdUser._id };
    const cartCreation = await Cart.create(newCart);

    if (createdUser && cartCreation) {
      return response.status(201).json({ message: "User created successfully." });
    } else {
      return response.status(500).json({ message: "Failed to create account" });
    }
  } catch (error) {
    console.error("Error in signup:", error);
    return response.status(500).json({ message: "Server error" });
  }
});

// Helper function to calculate age from birthday
function calculateAge(birthday) {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// Login route
userRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username exists in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username" });
    }

    // Compare the provided password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // If credentials are correct, generate a JWT token
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: "1h" }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users
userRouter.get("/allusers", async (request, response) => {
  try {
    const allUsers = await User.find({});
    return response.status(200).json({
      total_users: allUsers.length,
      allUsers: allUsers,
    });
  } catch (error) {
    console.log(error.message);
  }
});

// Get user profile
userRouter.get("/profile/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const userProfile = await User.findById(id);

    if (!userProfile) {
      return response.status(404).json({ message: "User profile not found" });
    }

    // Respond with user profile data
    return response.status(200).json({
      profile: userProfile,
    });
  } catch (error) {
    console.log(error.message);
  }
});

// Update Profile
userRouter.put(
  "/profile/update/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      // Get the user ID from params
      const { id } = req.params;

      // Get other details from the request body
      const { username, email } = req.body;

      // Validate inputs
      if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "Invalid username" });
      }
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ message: "Invalid email" });
      }

      // Check if image file is provided
      if (req.files && req.files.image && req.files.image[0]) {
        // Upload new profile picture
        const imageResult = await cloudinary.uploader.upload(
          req.files.image[0].path,
          {
            folder: "Profile pictures",
            resource_type: "image",
          }
        );

        // Check the URL
        if (!imageResult.secure_url) {
          return res.status(500).json({ message: "Image upload failed" });
        }

        // Create user object with updated profile picture URL
        const updatedUser = {
          username,
          email,
          profilePic: imageResult.secure_url,
        };

        // Find user by ID and update
        const userUpdate = await User.findByIdAndUpdate(id, updatedUser, {
          new: true, // Return updated document
          runValidators: true, // Run model validators on update
        });

        if (!userUpdate) {
          return res.status(404).json({ message: "Profile update failed" });
        }

        // Return the updated user
        return res.json(userUpdate);

        // Remove uploaded file from server
        fs.unlinkSync(req.files.image[0].path);
      } else {
        // If no image file provided, update username and email only
        const updatedUser = {
          username,
          email,
        };

        // Find user by ID and update
        const userUpdate = await User.findByIdAndUpdate(id, updatedUser, {
          new: true, // Return updated document
          runValidators: true, // Run model validators on update
        });

        if (!userUpdate) {
          return res.status(404).json({ message: "Profile update failed" });
        }

        // Return the updated user
        return res.json(userUpdate);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Change Status
userRouter.put("/changeStatus/:id", async (request, response) => {
  const { id } = request.params;
  const { newStatus } = request.body;

  try {
    const updatedUser = await User.updateOne(
      { _id: id },
      { $set: { status: newStatus } }
    );

    if (updatedUser.nModified === 0) {
      return response.status(404).json({ message: "User not found or status unchanged" });
    }

    response.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    response.status(500).json({ message: "Internal server error" });
  }
});

// Delete User
userRouter.delete("/delete/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return response.status(404).json({ message: "User not found" });
    }

    response.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    response.status(500).json({ message: "Internal server error" });
  }
});

export default userRouter;

//userAuthenticationRoutes.js
import express from "express";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { Cart } from "../models/cart.js";
import fs from "fs";
import cloudinary from "../utils/cloudinary.js";
import upload from "../middleware/multer.js";
import passport from "passport";

// Router
const userRouter = express.Router();

// User Registration
userRouter.post("/register", async (request, response) => {
  try {
    const {
      firstname,
      lastname,
      username,
      password,
      email,
      birthday,
      role,
      portfolioLink,
    } = request.body;

    // Validate input
    if (
      !firstname ||
      !lastname ||
      !username ||
      !password ||
      !email ||
      !birthday
    ) {
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
      developerAttributes: {},
    };

    // Add developer-specific attributes if role is Developer
    if (role === "Developer") {
      newUser.developerAttributes = {
        portfolioLink: portfolioLink ? portfolioLink.trim() : "", // Assign portfolioLink here
        status: "pending", // Default status for developer
      };
    }

    // Create a new user
    const createdUser = await User.create(newUser);

    // Create a cart for the user (if applicable, assuming all users need a cart)
    const newCart = { owner: createdUser._id };
    const cartCreation = await Cart.create(newCart);

    if (createdUser && cartCreation) {
      if (role === "developer") {
        return response.status(201).json({
          message: "Developer account created successfully.",
        });
      } else {
        return response
          .status(201)
          .json({ message: "User account created successfully." });
      }
    } else {
      return response.status(500).json({ message: "Failed to create account" });
    }
  } catch (error) {
    console.error("Error in signup:", error);
    return response.status(500).json({ message: "Server error" });
  }
});

userRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = req.user.token;
    res.redirect(`http://localhost:5000/login?token=${token}`);
  }
);

// Add success route for debugging
userRouter.get("/profile", (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

userRouter.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy();
    res.redirect("/");
  });
});

// Get all developers with pending status
userRouter.get("/developers/requests", async (req, res) => {
  try {
    const pendingDevelopers = await User.find({
      role: "Developer",
      "developerAttributes.status": "pending",
    });

    if (!pendingDevelopers.length) {
      return res.status(404).json({ message: "No pending developers found" });
    }

    res.status(200).json({ pendingDevelopers });
  } catch (error) {
    console.error("Error fetching pending developers:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve Developer
userRouter.put("/developers/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDeveloper = await User.findByIdAndUpdate(
      id,
      { "developerAttributes.status": "approved" },
      { new: true }
    );

    if (!updatedDeveloper) {
      return res.status(404).json({ message: "Developer not found" });
    }

    res.status(200).json({ message: "Developer approved successfully" });
  } catch (error) {
    console.error("Error approving developer:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject Developer
userRouter.put("/developers/reject/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDeveloper = await User.findByIdAndUpdate(
      id,
      { "developerAttributes.status": "rejected" },
      { new: true }
    );

    if (!updatedDeveloper) {
      return res.status(404).json({ message: "Developer not found" });
    }

    res.status(200).json({ message: "Developer rejected successfully" });
  } catch (error) {
    console.error("Error rejecting developer:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper function to calculate age from birthday
function calculateAge(birthday) {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
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

    // Check if the user is a developer
    if (user.role === "developer") {
      // Check the developer account status
      const developerStatus = user.developerAttributes?.status;

      // If the developer's account status is pending, reject login
      if (developerStatus === "pending") {
        return res.status(403).json({
          message:
            "Your account is still pending approval. Please wait for confirmation.",
        });
      }

      // If the developer's account status is rejected, reject login
      if (developerStatus === "rejected") {
        return res.status(403).json({
          message:
            "Your developer account has been rejected. Please contact support.",
        });
      }

      // If the developer's account status is approved, proceed with login
      if (developerStatus === "approved") {
        // Generate JWT token for an approved developer
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
      }
    } else {
      // Normal user login, proceed with generating JWT token
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
    }
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

// Get all developers
userRouter.get("/allDevelopers", async (request, response) => {
  try {
    // Find users where the role is 'developer'
    const allUsers = await User.find({ role: "developer" });
    return response.status(200).json({
      total_users: allUsers.length,
      allUsers: allUsers,
    });
  } catch (error) {
    console.log(error.message);
    return response.status(500).json({ message: "Internal server error" }); // Return error response
  }
});

// Get all approved developers with required fields
userRouter.get("/approvedDevelopers", async (req, res) => {
  try {
    const approvedDevelopers = await User.find({
      role: "developer",
      "developerAttributes.status": "approved",
    });

    return res.status(200).json({
      total_approved: approvedDevelopers.length,
      approvedDevelopers: approvedDevelopers,
    });
  } catch (error) {
    console.error("Error fetching approved developers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update developer info
userRouter.put("/developers/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body; // Contains the updated developer info

    const updatedDeveloper = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedDeveloper) {
      return res.status(404).json({ message: "Developer not found" });
    }

    res.status(200).json({
      message: "Developer updated successfully",
      developer: updatedDeveloper,
    });
  } catch (error) {
    console.error("Error updating developer:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Delete developer info
userRouter.delete("/developers/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDeveloper = await User.findByIdAndDelete(id);

    if (!deletedDeveloper) {
      return res.status(404).json({ message: "Developer not found" });
    }

    res.status(200).json({ message: "Developer deleted successfully" });
  } catch (error) {
    console.error("Error deleting developer:", error);
    res.status(500).json({ message: "Server error" });
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

    // Respond with user profile data including firstname and lastname
    return response.status(200).json({
      profile: userProfile,
    });
  } catch (error) {
    console.log(error.message);
    return response.status(500).json({ message: "Server error" });
  }
});

// Update Profile
userRouter.put(
  "/profile/update/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, firstname, lastname } = req.body;

      // Validate inputs
      if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "Invalid username" });
      }
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ message: "Invalid email" });
      }
      if (!firstname || typeof firstname !== "string") {
        return res.status(400).json({ message: "Invalid firstname" });
      }
      if (!lastname || typeof lastname !== "string") {
        return res.status(400).json({ message: "Invalid lastname" });
      }

      // Check if image file is provided
      let updatedUser = {
        username,
        email,
        firstname,
        lastname,
      };

      if (req.files && req.files.image && req.files.image[0]) {
        const imageResult = await cloudinary.uploader.upload(
          req.files.image[0].path,
          {
            folder: "Profile pictures",
            resource_type: "image",
          }
        );

        if (!imageResult.secure_url) {
          return res.status(500).json({ message: "Image upload failed" });
        }

        updatedUser.profilePic = imageResult.secure_url;

        // Remove uploaded file from server
        fs.unlinkSync(req.files.image[0].path);
      }

      // Find user by ID and update
      const userUpdate = await User.findByIdAndUpdate(id, updatedUser, {
        new: true,
        runValidators: true,
      });

      if (!userUpdate) {
        return res.status(404).json({ message: "Profile update failed" });
      }

      // Return the updated user
      return res.json(userUpdate);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Change Password
userRouter.put("/profile/change-password/:id", async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password (assuming you are using bcrypt)
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Check password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.",
      });
    }

    // Hash new password and update user
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

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
      return response
        .status(404)
        .json({ message: "User not found or status unchanged" });
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

// Update developer income route
userRouter.put("/update-income/:id", async (req, res) => {
  const { id } = req.params; // Developer ID
  const { saleAmount } = req.body; // Sale amount from the body

  // Validate saleAmount
  if (typeof saleAmount !== "number" || isNaN(saleAmount)) {
    return res.status(400).json({ error: "Invalid sale amount" });
  }

  try {
    // Find the developer by ID and ensure the user is a developer
    const developer = await User.findOne({ _id: id, role: "developer" });

    if (!developer) {
      return res
        .status(404)
        .json({ error: "Developer not found or not a developer" });
    }

    // Calculate 70% of the sale amount (DevFunds)
    const devFunds = saleAmount * 0.7;

    // Ensure current income is a number before adding
    const currentIncome = developer.developerAttributes.income || 0;
    const newIncome = currentIncome + devFunds;

    // Update the developer's income
    developer.developerAttributes.income = newIncome;
    await developer.save();

    res.status(200).json({
      message: "Income updated successfully",
      updatedIncome: newIncome,
      developer: developer,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update income", details: error.message });
  }
});

// Get developer income route
userRouter.get("/get-income/:id", async (req, res) => {
  const { id } = req.params; // Developer ID

  try {
    // Find the developer by ID and ensure the user is a developer
    const developer = await User.findOne({ _id: id, role: "developer" });

    if (!developer) {
      return res
        .status(404)
        .json({ error: "Developer not found or not a developer" });
    }

    // Get the developer's income
    const currentIncome = developer.developerAttributes.income || 0;

    res.status(200).json({
      message: "Income retrieved successfully",
      income: currentIncome,
      developer: developer,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to retrieve income", details: error.message });
  }
});

// Get all users with moderator roles
userRouter.get("/moderators", async (req, res) => {
  try {
    const moderatorRoles = [
      "Product Manager",
      "User Manager",
      "Order Manager",
      "Session_Manager",
      "Community Manager",
      "Review Manager",
      "Support Agent",
      "Staff_Manager",
      "Payment Manager",
    ];
    const moderators = await User.find({
      role: { $in: moderatorRoles },
    }).select("-password");
    res.status(200).json(moderators);
  } catch (error) {
    console.error("Error fetching moderators:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default userRouter;

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from "../models/user.js"; // Adjust the import path as necessary
import cloudinary from '../utils/cloudinary.js'; // Adjust the import path as necessary
import upload from '../middleware/multer.js'; // Adjust the import path as necessary
import { JWT_SECRET } from '../config.js'; // Import your JWT secret (update if needed)

const developerRouter = express.Router();

// Register a new developer
developerRouter.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, username, email, password, birthday } = req.body;

    // Validate input
    if (!firstname || !lastname || !username || !email || !password || !birthday) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the developer already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Assign the role (either provided or default to 'Developer')
    const assignedRole = 'Developer';

    // Calculate age from birthday
    const birthDate = new Date(birthday);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    // Create a new user with developer attributes
    const newUser = new User({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      role: assignedRole,
      birthday,
      age,
      developerAttributes: {
        portfolioLinks,
        status: 'pending' // Default status to 'pending'
      }
    });

    await newUser.save();

    res.status(201).json({ message: 'Developer registration request submitted.' });
  } catch (error) {
    console.error('Error registering developer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login a developer
developerRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the developer exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the developer's status is 'approved'
    if (user.role === 'Developer' && user.developerAttributes.status !== 'approved') {
      return res.status(403).json({ message: 'Your request is not approved yet' });
    }

    // Compare the provided password with the stored hash
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    };

    // Sign JWT and return the token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1d' }, // Token expires in 1 day
      (err, token) => {
        if (err) {
          console.error('JWT generation error:', err);
          return res.status(500).json({ message: 'Token generation failed' });
        }
        res.status(200).json({ token, message: 'Login successful' });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all pending developer requests
developerRouter.get('/requests', async (req, res) => {
  try {
    // Fetch all users with role 'Developer' and status 'pending'
    const pendingDevelopers = await User.find({
      role: 'Developer',
      'developerAttributes.status': 'pending'
    });

    res.status(200).json({ total_requests: pendingDevelopers.length, pendingDevelopers });
  } catch (error) {
    console.error('Error fetching pending developer requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Approve developer request
developerRouter.put('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Update developer status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 'developerAttributes.status': 'approved' },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Developer not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error approving developer request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Reject developer request
developerRouter.put('/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Update developer status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 'developerAttributes.status': 'rejected' },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Developer not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error rejecting developer request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update developer profile with profile picture
developerRouter.put('/update/:id', upload.single('profilePic'), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, username, email, portfolioLinks } = req.body;

    let profilePicUrl;

    // Check if a profile picture is uploaded
    if (req.file) {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profile_pictures', // Cloudinary folder
        resource_type: 'image',
      });

      // Store the URL of the uploaded image
      profilePicUrl = result.secure_url;
    }

    // Update user information
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstname,
        lastname,
        username,
        email,
        profilePic: profilePicUrl,
        'developerAttributes.portfolioLinks': portfolioLinks // Update portfolio links
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Developer not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating developer profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all developers
developerRouter.get('/all', async (req, res) => {
  try {
    const allDevelopers = await User.find({ role: 'Developer' });
    res.status(200).json({ total_developers: allDevelopers.length, allDevelopers });
  } catch (error) {
    console.error('Error fetching developers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a developer by ID
developerRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const developer = await User.findById(id);

    if (!developer || developer.role !== 'Developer') {
      return res.status(404).json({ message: 'Developer not found' });
    }

    res.status(200).json(developer);
  } catch (error) {
    console.error('Error fetching developer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a developer
developerRouter.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser || deletedUser.role !== 'Developer') {
      return res.status(404).json({ message: 'Developer not found' });
    }

    res.status(200).json({ message: 'Developer deleted successfully' });
  } catch (error) {
    console.error('Error deleting developer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
export default developerRouter;
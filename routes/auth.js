const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // ✅ correct
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the user data to the request object
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send token and user data as part of the response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get all users
router.get('/all-users', async (req, res) => {
  try {
    const users = await User.find({}, 'name'); // Fetch all users but only return the name field
    const userNames = users.map(user => user.name); // Extract the names from the users
    res.status(200).json({ users: userNames });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user names', details: err.message });
  }
});

// Route to get the logged-in user's details (protected route)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId from the token
    const user = await User.findById(userId).select('-password'); // Fetch user details excluding the password
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        // You can include other fields as needed
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details', details: err.message });
  }
});

module.exports = router;

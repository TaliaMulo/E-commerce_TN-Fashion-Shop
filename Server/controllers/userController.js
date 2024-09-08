const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { first_name, last_name, age, userName, password, email } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        //Hashes the user's password with a salt factor of 10 to ensure it is securely stored
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        user = new User({
            first_name,
            last_name,
            Age: age,
            userName,
            password: hashedPassword,
            email,
            isAdmin: false
        });


        // Save user to database
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // The token is set to expire in 3 hours
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3h' });

        // Save the generated token to the user's current session in the database
        user.currentSessionToken = token;
        await user.save();

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.userName,
                lastName: user.last_name,
                isAdmin: user.isAdmin,
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addToFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.favorites.includes(itemId)) {
            user.favorites.push(itemId);
            await user.save();
        }

        res.status(200).json({ message: 'Item added to favorites' });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.favorites = user.favorites.filter(id => id.toString() !== itemId);
        await user.save();

        res.status(200).json({ message: 'Item removed from favorites' });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).populate('favorites');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user details
        const user = await User.findById(userId, 'first_name last_name email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
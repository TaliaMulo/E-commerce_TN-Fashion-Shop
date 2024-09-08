const Item = require('../models/itemModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');

exports.getItemsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        console.log(`Fetching items for category: ${category}`);

        const items = await Item.find({ category, isActive: true });

        console.log(`Found ${items.length} items`);
        res.json(items);
    } catch (error) {
        console.error('Error in getItemsByCategory:', error);
        res.status(500).json({ message: error.message });
    }
};


exports.getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Item.findOne({ _id: id, isActive: true });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        console.error('Error in getItemById:', error);
        res.status(500).json({ message: error.message });
    }
};



exports.addToCart = async (req, res) => {
    try {
        const { itemId, quantity, size } = req.body;
        const userId = req.user.id;

        if (!itemId || !quantity || !size) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.item.toString() === itemId && item.size === size);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ item: itemId, quantity, size });
        }

        await cart.save();

        // Populate the items to get the full item details
        await cart.populate('items.item');

        res.status(200).json({ message: 'Item added to cart successfully', cart });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addItem = async (req, res) => {
    try {
        const { name, category, type, image, sizeStock, price, color } = req.body;

        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        if (!name || !category || !type || !image || !color || !sizeStock || !price) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newItem = new Item({
            name,
            category,
            type,
            image,
            sizeStock,
            price: parseFloat(price),
            color
        });

        const savedItem = await newItem.save();
        console.log('Item saved successfully:', savedItem);

        res.status(201).json({ message: 'Item added successfully', item: savedItem });
    } catch (error) {
        console.error('Error adding new item:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, type, image, sizeStock, price, color } = req.body;

        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const updatedItem = await Item.findByIdAndUpdate(
            id,
            {
                name,
                category,
                type,
                image,
                sizeStock,
                price: parseFloat(price),
                color,
                totalStock: sizeStock.reduce((total, size) => total + size.stock, 0)
            },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        // Update the item to set isActive to false
        const updatedItem = await Item.findByIdAndUpdate(id, { isActive: false }, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Remove the item from all carts
        await Cart.updateMany(
            { 'items.item': id },
            { $pull: { items: { item: id } } }
        );

        // Remove the item from all users' favorite lists
        await User.updateMany(
            { favorites: id },
            { $pull: { favorites: id } }
        );

        // Get the updated cart count for the user who made the delete request
        const userCart = await Cart.findOne({ user: req.user.id });
        const updatedCartCount = userCart ? userCart.items.reduce((total, item) => total + item.quantity, 0) : 0;

        res.json({
            message: 'Item deleted successfully and removed from carts and favorite lists',
            updatedCartCount
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.searchItems = async (req, res) => {
    try {
        const { searchTerm } = req.params;
        const items = await Item.find({
            isActive: true,
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } },
                { type: { $regex: searchTerm, $options: 'i' } }
            ]
        });

        res.json(items);
    } catch (error) {
        console.error('Error searching items:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRandomItems = async (req, res) => {
    try {
        const count = parseInt(req.params.count) || 5;
        const items = await Item.aggregate([
            { $match: { isActive: true } },
            { $sample: { size: count } }
        ]);
        res.json(items);
    } catch (error) {
        console.error('Error fetching random items:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
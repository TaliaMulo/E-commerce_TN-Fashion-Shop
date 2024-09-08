const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Item = require('../models/itemModel');

function generateOrderNumber() {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
}

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { totalAmount, shippingDetails, shippingMethod } = req.body;

        // Fetch the user's cart
        const cart = await Cart.findOne({ user: userId }).populate('items.item');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Validate shipping details
        const requiredFields = ['firstName', 'lastName', 'address', 'city', 'postalCode', 'phoneNumber'];
        for (const field of requiredFields) {
            if (!shippingDetails[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        // Create order items and update stock
        const orderItems = [];
        for (const cartItem of cart.items) {
            const item = await Item.findById(cartItem.item._id);
            const sizeIndex = item.sizeStock.findIndex(s => s.size === cartItem.size);

            if (sizeIndex === -1 || item.sizeStock[sizeIndex].stock < cartItem.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${item.name} in size ${cartItem.size}` });
            }

            // Decrease stock
            item.sizeStock[sizeIndex].stock -= cartItem.quantity;
            item.totalStock -= cartItem.quantity;
            await item.save();

            orderItems.push({
                item: cartItem.item._id,
                quantity: cartItem.quantity,
                size: cartItem.size,
                price: cartItem.item.price
            });
        }

        // Generate unique order number
        const orderNumber = generateOrderNumber();

        // Create the new order
        const newOrder = new Order({
            orderNumber,
            user: userId,
            items: orderItems,
            totalAmount,
            shippingDetails,
            shippingMethod
        });

        await newOrder.save();

        // Clear the user's cart
        cart.items = [];
        await cart.save();

        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find orders for the user, populate item details, and sort by order date
        const orders = await Order.find({ user: userId })
            .populate('items.item', 'name image') // Add 'name','image' to the populated fields
            .sort({ orderDate: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

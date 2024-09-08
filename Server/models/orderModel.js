const mongoose = require('mongoose');
// Define the schema for the orders collection
const orderItemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'items',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    size: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingDetails: {
        firstName: String,
        lastName: String,
        address: String,
        city: String,
        postalCode: String,
        phoneNumber: String
    },
    shippingMethod: {
        type: String,
        enum: ['home', 'mailbox'],
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});
// Create the order model using the defined schema
const Order = mongoose.model('orders', orderSchema);
// Export the order model for use in other parts of the application
module.exports = Order;
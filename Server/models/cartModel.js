const mongoose = require('mongoose');
// Define the schema for the carts collection
const cartItemSchema = new mongoose.Schema({
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
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    items: [cartItemSchema]
});
//Create the cart model using the defined schema
const Cart = mongoose.model('carts', cartSchema);
// Export the cart model for use in other parts of the application
module.exports = Cart;
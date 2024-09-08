const mongoose = require('mongoose');

const sizeStockSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    }
});
// Define the schema for the items collection
const itemSchema = new mongoose.Schema({
    id: {
        type: Number,
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    sizeStock: [sizeStockSchema],
    price: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalStock: {
        type: Number,
        default: 0
    }
});

itemSchema.pre('save', function (next) {
    this.totalStock = this.sizeStock.reduce((total, size) => total + size.stock, 0);
    next();
});

//Create the item model using the defined schema
const Item = mongoose.model('items', itemSchema);
// Export the item model for use in other parts of the application
module.exports = Item;
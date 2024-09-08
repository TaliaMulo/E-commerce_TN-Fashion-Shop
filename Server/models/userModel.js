const mongoose = require('mongoose');
// Define the schema for the users collection
const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    Age: {
        type: Number,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'items'
    }]
});
// Create the User model using the defined schema
const User = mongoose.model('users', userSchema);
// Export the User model for use in other parts of the application
module.exports = User;
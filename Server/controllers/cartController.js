const Cart = require('../models/cartModel');
const Item = require('../models/itemModel');


exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId }).populate('items.item');

        if (!cart) {
            return res.status(200).json({ items: [], cartCount: 0 });
        }

        const updatedItems = [];
        let cartModified = false;
        let cartCount = 0;

        for (const cartItem of cart.items) {
            if (cartItem.item) {
                const item = await Item.findById(cartItem.item._id);
                if (item) {
                    const sizeStock = item.sizeStock.find(s => s.size === cartItem.size);
                    if (sizeStock) {
                        if (sizeStock.stock === 0) {
                            cartModified = true;
                            // Item with zero stock is removed from the cart
                        } else if (sizeStock.stock < cartItem.quantity) {
                            cartModified = true;
                            cartItem.quantity = sizeStock.stock;
                            updatedItems.push(cartItem);
                            cartCount += sizeStock.stock;
                        } else {
                            updatedItems.push(cartItem);
                            cartCount += cartItem.quantity;
                        }
                    } else {
                        cartModified = true;
                        // Size not found, remove from cart
                    }
                } else {
                    cartModified = true;
                    // Item not found, remove from cart
                }
            }
        }

        if (cartModified) {
            cart.items = updatedItems;
            await cart.save();
        }

        res.status(200).json({ items: cart.items, cartCount });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId, quantity, size } = req.body;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].size = size;

        await cart.save();

        res.status(200).json({ message: 'Cart item updated successfully', cart });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        await cart.save();

        res.status(200).json({ message: 'Item removed from cart successfully', cart });
    } catch (error) {
        console.error('Error deleting cart item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
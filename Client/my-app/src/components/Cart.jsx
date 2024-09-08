import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import update_icon from './Assets/edit.png';
import garbage_icon from './Assets/bin_black.png';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [editingItem, setEditingItem] = useState(null);
    const [editedValues, setEditedValues] = useState({});
    const [couponCode, setCouponCode] = useState('');
    const [discountedAmount, setDiscountedAmount] = useState(0);
    const [showCouponInput, setShowCouponInput] = useState(false);
    const { updateCartCount } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        calculateTotal();
    }, [cartItems]);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get('http://localhost:5000/api/cart/get-cart', config);
            setCartItems(response.data.items);
            updateCartCount(response.data.cartCount);
        } catch (error) {
            console.error('Error fetching cart:', error);
            alert('Failed to fetch cart. Please try again later.');
        }
    };


    const calculateTotal = () => {
        const total = cartItems.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
        setTotalAmount(total);
        setDiscountedAmount(total);
    };


    const handleUpdate = async (itemId) => {
        const itemToUpdate = editedValues[itemId];
        if (itemToUpdate.quantity < 1) {
            alert('Quantity must be at least 1');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            await axios.put('http://localhost:5000/api/cart/update-item', {
                itemId,
                quantity: itemToUpdate.quantity,
                size: itemToUpdate.size
            }, config);
            setEditingItem(null);
            setEditedValues({});
            fetchCart();
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item. Please try again later.');
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            await axios.delete(`http://localhost:5000/api/cart/delete-item/${itemId}`, config);
            fetchCart();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item. Please try again later.');
        }
    };

    const handleEdit = (itemId) => {
        const item = cartItems.find(item => item._id === itemId);
        setEditedValues({
            ...editedValues,
            [itemId]: { quantity: item.quantity, size: item.size }
        });
        setEditingItem(itemId);
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setEditedValues({});
    };

    const handleQuantityChange = (itemId, newQuantity) => {
        setEditedValues({
            ...editedValues,
            [itemId]: { ...editedValues[itemId], quantity: newQuantity }
        });
    };

    const handleSizeChange = (itemId, newSize) => {
        setEditedValues({
            ...editedValues,
            [itemId]: { ...editedValues[itemId], size: newSize }
        });
    };

    const handleImageClick = (itemId) => {
        navigate(`/item/${itemId}`);
    };

    const applyCoupon = () => {
        if (couponCode === 'TN15') {
            const discountedTotal = totalAmount * 0.85; // 15% discount
            setDiscountedAmount(discountedTotal);
        } else {
            alert('Invalid coupon code');
            setDiscountedAmount(totalAmount);
        }
    };

    const toggleCouponInput = () => {
        setShowCouponInput(!showCouponInput);
        if (!showCouponInput) {
            setCouponCode('');
            setDiscountedAmount(totalAmount);
        }
    };

    const handleCheckout = () => {
        navigate('/checkout', { state: { discountedAmount: discountedAmount } });
    };

    return (
        <div className="cart-container">
            <h2>Your Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <div className="empty-cart-message">
                    Your cart is empty. Please add items to your cart.
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-items">
                        <table className="cart-table">
                            <table className="cart-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Description</th>
                                        <th>Size</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((cartItem) => (
                                        <tr key={cartItem._id}>
                                            <td>
                                                <img
                                                    src={cartItem.item.image}
                                                    alt={cartItem.item.name}
                                                    className="cart-item-image"
                                                    onClick={() => handleImageClick(cartItem.item._id)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td>{cartItem.item.name}</td>
                                            <td className='select'>
                                                {editingItem === cartItem._id ? (
                                                    <select
                                                        value={editedValues[cartItem._id].size}
                                                        onChange={(e) => handleSizeChange(cartItem._id, e.target.value)}
                                                    >
                                                        {cartItem.item.sizeStock.map((sizeStock) => (
                                                            <option key={sizeStock.size} value={sizeStock.size} disabled={sizeStock.stock === 0}>
                                                                {sizeStock.size} {sizeStock.stock === 0 ? '(Out of Stock)' : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    cartItem.size
                                                )}
                                            </td>
                                            <td>${cartItem.item.price.toFixed(2)}</td>
                                            <td className='input'>
                                                {editingItem === cartItem._id ? (
                                                    <input
                                                        type="number"
                                                        value={editedValues[cartItem._id].quantity}
                                                        onChange={(e) => handleQuantityChange(cartItem._id, parseInt(e.target.value))}
                                                        min="1"
                                                    />
                                                ) : (
                                                    cartItem.quantity
                                                )}
                                            </td>
                                            <td>${(cartItem.item.price * cartItem.quantity).toFixed(2)}</td>
                                            <td>
                                                {editingItem === cartItem._id ? (
                                                    <>
                                                        <button onClick={() => handleUpdate(cartItem._id)} className="edit-button">Save</button>
                                                        <button onClick={handleCancelEdit} className="edit-button">Cancel</button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleEdit(cartItem._id)} className="icon-button">
                                                        <img src={update_icon} alt="Edit" className="icon" />
                                                    </button>
                                                )}
                                            </td>
                                            <td>
                                                <button onClick={() => handleDeleteItem(cartItem._id)} className="icon-button">
                                                    <img src={garbage_icon} alt="Remove" className="icon" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </table>
                    </div>
                    <div className="order-summary">
                        <h3>Order Summary</h3>
                        <div className="coupon-section">
                            <div className="coupon-toggle" onClick={toggleCouponInput}>
                                <span>Do you have a coupon code?</span>
                                <span className={`arrow ${showCouponInput ? 'up' : 'down'}`}></span>
                            </div>
                            {showCouponInput && (
                                <div className="coupon-input">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                    />
                                    <button onClick={applyCoupon}>Apply</button>
                                </div>
                            )}
                        </div>
                        <div className="summary-item">
                            <span>Subtotal</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                        {discountedAmount < totalAmount && (
                            <div className="summary-item discount">
                                <span>Discount</span>
                                <span>-${(totalAmount - discountedAmount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="summary-item total">
                            <span>Total</span>
                            <span>${discountedAmount.toFixed(2)}</span>
                        </div>
                        <button
                            className="checkout-button"
                            onClick={handleCheckout}
                        >
                            Go to checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Cart;
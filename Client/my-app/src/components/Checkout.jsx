import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import './Checkout.css';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [shippingMethod, setShippingMethod] = useState('home');
    const [paymentMethod, setPaymentMethod] = useState('payment');
    const [shippingCost, setShippingCost] = useState(10);
    const [shippingDetails, setShippingDetails] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        phoneNumber: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [showEmptyFieldsMessage, setShowEmptyFieldsMessage] = useState(false);
    const { updateCartCount } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const discountedAmount = location.state?.discountedAmount || 0;


    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        calculateShipping();
    }, [totalAmount, shippingMethod]);

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
            calculateTotal(response.data.items);
        } catch (error) {
            console.error('Error fetching cart:', error);
            alert('Failed to fetch cart. Please try again later.');
        }
    };

    const calculateTotal = (items) => {
        const total = items.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
        setTotalAmount(discountedAmount > 0 ? discountedAmount : total);
    };

    const calculateShipping = () => {
        if (totalAmount > 60) {
            setShippingCost(0);
        } else {
            setShippingCost(shippingMethod === 'home' ? 10 : 5);
        }
    };


    const handleShippingMethodChange = (method) => {
        setShippingMethod(method);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const validateShippingDetails = () => {
        return Object.values(shippingDetails).every(value => value.trim() !== '');
    };


    const handlePlaceOrder = async () => {
        if (!validateShippingDetails()) {
            setShowEmptyFieldsMessage(true);
            setTimeout(() => setShowEmptyFieldsMessage(false), 3000); // Hide message after 3 seconds
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

            const orderData = {
                totalAmount: totalAmount + shippingCost,
                shippingDetails,
                shippingMethod
            };

            const response = await axios.post('http://localhost:5000/api/orders/create', orderData, config);

            if (response.status === 201) {
                setOrderNumber(response.data.order.orderNumber);
                setShowModal(true);
                updateCartCount(0); // Update the cart count to 0
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again later.');
        }
    };



    const closeModal = () => {
        setShowModal(false);
        navigate('/');
    };

    return (
        <div className="checkout-container">
            <h1>Checkout</h1>
            <div className="checkout-layout">
                <div className="checkout-details">
                    <section className="shipping-method">
                        <h2>Shipping Method</h2>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    value="home"
                                    checked={shippingMethod === 'home'}
                                    onChange={() => handleShippingMethodChange('home')}
                                />
                                Home Delivery {totalAmount > 60 ? '(Free)' : '($10)'}
                            </label>
                            {shippingMethod === 'home' && (
                                <p className="delivery-info">Your order will be delivered in 4 - 5 working days</p>
                            )}
                            <label>
                                <input
                                    type="radio"
                                    value="mailbox"
                                    checked={shippingMethod === 'mailbox'}
                                    onChange={() => handleShippingMethodChange('mailbox')}
                                />
                                Mailbox Delivery {totalAmount > 60 ? '(Free)' : '($5)'}
                            </label>
                            {shippingMethod === 'mailbox' && (
                                <p className="delivery-info">Your order will be delivered in 1 - 2 working weeks</p>
                            )}
                        </div>
                    </section>
                    <section className="shipping-details">
                        <h2>Shipping Details</h2>
                        {showEmptyFieldsMessage && (
                            <div className="empty-fields-message">
                                Please fill in all required fields.
                            </div>
                        )}
                        <form>
                            <div className="form-row">
                                <input type="text" name="firstName" placeholder="First Name" required value={shippingDetails.firstName} onChange={handleInputChange} />
                                <input type="text" name="lastName" placeholder="Last Name" required value={shippingDetails.lastName} onChange={handleInputChange} />
                            </div>
                            <input type="text" name="address" placeholder="Address" required value={shippingDetails.address} onChange={handleInputChange} />
                            <div className="form-row">
                                <input type="text" name="city" placeholder="City" required value={shippingDetails.city} onChange={handleInputChange} />
                                <input type="text" name="postalCode" placeholder="Postal Code" required value={shippingDetails.postalCode} onChange={handleInputChange} />
                            </div>
                            <input type="tel" name="phoneNumber" placeholder="Phone Number" required value={shippingDetails.phoneNumber} onChange={handleInputChange} />
                        </form>
                    </section>
                    <section className="payment-method">
                        <h2>Payment Method</h2>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    value="payment"
                                    checked={paymentMethod === 'payment'}
                                    onChange={() => setPaymentMethod('payment')}
                                />
                                Payment will be made when the package is delivered to the customer
                            </label>
                        </div>
                    </section>
                    <button className="place-order-button" onClick={handlePlaceOrder}>Place Order</button>
                </div>
                <div>
                    <div className="order-summary-checkout">
                        <h2>Order Summary</h2>
                        <div className="summary-details">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>${shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>${(totalAmount + shippingCost).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="cart-checkout">
                        <div className="my-cart-edit">
                            <h2>My Cart</h2>
                            <Link to="/cart">Edit</Link>
                        </div>
                        <div className="cart-items-checkout">
                            {cartItems.map((item) => (
                                <div key={item._id} className="cart-item-checkout">
                                    <img src={item.item.image} alt={item.item.name} className="item-image-checkout" />
                                    <div className="item-details-checkout">
                                        <h4>{item.item.name}</h4>
                                        <p>Size: {item.size}</p>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Price: ${(item.item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Thank you for shopping with us!</h2>
                        <p>Your order number is: {orderNumber}</p>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Checkout;

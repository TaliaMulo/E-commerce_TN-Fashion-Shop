import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDetailsPage.css';
import order_history_icon from './Assets/order-history.png';
import id_card_white from './Assets/id-card-white.png';

const UserDetailsPage = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userResponse, ordersResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/users/details', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get('http://localhost:5000/api/orders/user-orders', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);

                setUserDetails(userResponse.data);
                setOrders(ordersResponse.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch user details and orders');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleOrderDetails = (orderNumber) => {
        setExpandedOrder(expandedOrder === orderNumber ? null : orderNumber);
    };

    if (loading) return <div className="user-details-page loading">Loading...</div>;
    if (error) return <div className="user-details-page error">{error}</div>;

    return (
        <div className="user-details-page">
            <div className="user-details-container">
                <h1>My Account</h1>
                {userDetails && (
                    <div className="user-info">
                        <h2>
                            My Details
                            <img src={id_card_white} alt="ID Card Icon" className="title-icon" />
                        </h2>
                        <div className="info-item">
                            <label>Name:</label>
                            <p>{userDetails.first_name}</p>
                            <p>{userDetails.last_name}</p>
                        </div>
                        <div className="info-item">
                            <label>Email:</label>
                            <p>{userDetails.email}</p>
                        </div>
                    </div>
                )}

                <div className="orders-section">
                    <h2>
                        Order History
                        <img src={order_history_icon} alt="Order History Icon" className="title-icon" />
                    </h2>
                    {orders.length > 0 ? (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order.orderNumber} className="order-item">
                                    <div className="order-summary-details" onClick={() => toggleOrderDetails(order.orderNumber)}>
                                        <div className="order-info">
                                            <span className="order-number"> {order.orderNumber}</span>
                                            <span className="order-date">{new Date(order.orderDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="order-total-arrow">
                                            <span className="order-total">${order.totalAmount.toFixed(2)}</span>
                                            <span className={`arrow ${expandedOrder === order.orderNumber ? 'up' : 'down'}`}></span>
                                        </div>
                                    </div>
                                    {expandedOrder === order.orderNumber && (
                                        <div className="order-details">
                                            <h4>Shipping Details</h4>
                                            <div className="shipping-details">
                                                <p><strong>Name:</strong> {order.shippingDetails.firstName} {order.shippingDetails.lastName}</p>
                                                <p><strong>Address:</strong> {order.shippingDetails.address}</p>
                                                <div className="shipping-row">
                                                    <p><strong>City:</strong> {order.shippingDetails.city}</p>
                                                    <p><strong>Postal Code:</strong> {order.shippingDetails.postalCode}</p>
                                                </div>
                                                <p><strong>Phone Number:</strong> {order.shippingDetails.phoneNumber}</p>
                                                <p><strong>Shipping Method:</strong> {order.shippingMethod}</p>
                                            </div>
                                            <h4>Ordered Items</h4>
                                            <ul>
                                                {order.items.map((item, index) => (
                                                    <li key={index} className="order-item-detail">
                                                        <img
                                                            src={item.item.image}
                                                            alt={item.item.name}
                                                            className="order-item-image"
                                                        />
                                                        <div className="order-item-info">
                                                            <h5>{item.item.name}</h5>
                                                            <p>Quantity: {item.quantity}</p>
                                                            <p>Size: {item.size}</p>
                                                            <p>Price: ${item.price.toFixed(2)}</p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-orders">No orders found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetailsPage;

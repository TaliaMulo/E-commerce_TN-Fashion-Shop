import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import './ItemDetails.css';

const ItemDetails = () => {
    const [item, setItem] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const { user, updateCartCount } = useAuth();
    const navigate = useNavigate();

    const isOutOfStock = () => {
        return item.sizeStock.every(sizeStock => sizeStock.stock === 0);
    };

    useEffect(() => {
        const fetchItem = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/items/${id}`);
                setItem(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching item:', error);
                setError('Failed to fetch item details. Please try again later.');
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const handleAddToCart = async () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            const body = {
                itemId: item._id,
                quantity,
                size: selectedSize
            };
            const response = await axios.post('http://localhost:5000/api/items/add-to-cart', body, config);
            const newCartCount = response.data.cart.items.reduce((total, item) => total + item.quantity, 0);
            updateCartCount(newCartCount);
            alert('Item added to cart');
        } catch (error) {
            console.error('Error adding item to cart:', error);
            alert('Failed to add item to cart. Please try again later.');
        }
    };

    const handleSizeChange = (e) => {
        setSelectedSize(e.target.value);
        setQuantity(1); // Reset quantity when size changes
    };

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value);
        const maxStock = item.sizeStock.find(s => s.size === selectedSize)?.stock || 0;
        setQuantity(Math.min(newQuantity, maxStock));
    };


    const handleDeleteItem = async () => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { 'Authorization': `Bearer ${token}` }
                };
                const response = await axios.delete(`http://localhost:5000/api/items/${id}`, config);

                // Update the cart count with the returned value
                updateCartCount(response.data.updatedCartCount);

                alert('Item deleted successfully');
                navigate(`/category/${item.category.toLowerCase()}`);
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Failed to delete item. Please try again later.');
            }
        }
    };


    const handleAddToFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/users/favorites',
                { itemId: item._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Item added to favorites');
        } catch (error) {
            console.error('Error adding item to favorites:', error);
            alert('Failed to add item to favorites. Please try again later.');
        }
    };

    if (loading) return <div className="item-details loading">Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!item) return <div>Item not found</div>;

    return (
        <div className="item-details">
            <div className="item-image-container">
                <img src={item.image} alt={item.name} className="item-image" />
                {isOutOfStock() && <div className="out-of-stock-label">OUT OF STOCK</div>}
            </div>
            <div className="item-info">
                <h2>{item.name}</h2>
                <p>Category: {item.category}</p>
                <p>Type: {item.type}</p>
                <p>Colors: {item.color}</p>
                <p>Price: ${item.price}</p>
                <br />

                {!user && (
                    <p className="login">
                        Please <Link to="/login">Login</Link> to add the item to the cart
                    </p>
                )}
                {user && (
                    <>
                        <div className="select-size" >
                            <select
                                value={selectedSize}
                                onChange={handleSizeChange}
                                required
                            >
                                <option value="">Select Size</option>
                                {item.sizeStock.map((sizeStock) => (
                                    <option key={sizeStock.size} value={sizeStock.size} disabled={sizeStock.stock === 0}>
                                        {sizeStock.size} {sizeStock.stock === 0 ? '(Out of Stock)' : ''}
                                    </option>


                                ))}
                            </select>
                            {user.isAdmin && selectedSize && (
                                <p>
                                    Available Stock: {item.sizeStock.find(s => s.size === selectedSize)?.stock || 0}
                                </p>
                            )}
                        </div>
                        <br />
                        {selectedSize && (
                            <input
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                                min="1"
                                max={item.sizeStock.find(s => s.size === selectedSize)?.stock || 0}
                                required
                            />
                        )}
                        <button className="add-to-cart-button" onClick={handleAddToCart} >Add to Cart</button>
                        <button className="add-to-favorites-button" onClick={handleAddToFavorites}>Add to Favorites</button>
                    </>
                )}
                {user && user.isAdmin && (
                    <>
                        <Link to={`/edit-item/${item._id}`}>
                            <button className="edit-button-details">Edit Item</button>
                        </Link>
                        <button className="delete-button" onClick={handleDeleteItem}>Delete Item</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ItemDetails;
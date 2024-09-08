import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import './FavoriteList.css';
import garbage_icon from './Assets/bin_black.png';

const FavoriteList = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users/favorites', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter out inactive items
            const activeItems = response.data.filter(item => item.isActive);
            setFavorites(activeItems);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setError('Failed to fetch favorites. Please try again later.');
            setLoading(false);
        }
    };

    const removeFromFavorites = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/users/favorites/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFavorites(favorites.filter(item => item._id !== itemId));
        } catch (error) {
            console.error('Error removing from favorites:', error);
            alert('Failed to remove item from favorites. Please try again later.');
        }
    };

    if (loading) return <div className="favorite-list loading">Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="favorite-list">
            <h2>Your Favorites</h2>
            {favorites.length === 0 ? (
                <p>You haven't added any items to your favorites yet.</p>
            ) : (
                <div className="favorite-grid">
                    {favorites.map(item => (
                        <div key={item._id} className="favorite-item">
                            <Link to={`/item/${item._id}`}>
                                <img src={item.image} alt={item.name} />
                            </Link>
                            <h3>{item.name}</h3>
                            <div className="item-details-favorite">
                                <p>${item.price}</p>
                                <button onClick={() => removeFromFavorites(item._id)}>
                                    <img src={garbage_icon} alt="Remove" className="garbage-icon" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoriteList;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ItemList.css';
import FilterSidebar from './FilterSidebar';
import { useAuth } from '../AuthContext';

const ItemList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [types, setTypes] = useState([]);
    const [colors, setColors] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const { category } = useParams();
    const { user, updateCartCount } = useAuth();
    const isShopPage = category.toLowerCase() === 'home';

    const priceRanges = [
        { min: 0, max: 19.99 },
        { min: 20, max: 35 },
        { min: 35.01, max: Infinity }
    ];

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/items/category/${category}`);
                setItems(response.data);

                // Extract unique types and colors from fetched items
                const uniqueTypes = [...new Set(response.data.map(item => item.type))];
                setTypes(uniqueTypes);
                const uniqueColors = [...new Set(response.data.flatMap(item =>
                    item.color ? item.color.split(',').map(c => c.trim()) : []
                ))];
                setColors(uniqueColors);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching items:', error);
                setError('Failed to fetch items. Please try again later.');
                setLoading(false);
            }
        };

        const fetchFavorites = async () => {
            if (user) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        console.log('No token found, skipping favorites fetch');
                        return;
                    }
                    const response = await axios.get('http://localhost:5000/api/users/favorites', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setFavorites(response.data.map(item => item._id));
                } catch (error) {
                    console.error('Error fetching favorites:', error);
                    if (error.response && error.response.status === 401) {
                        console.log('Unauthorized, clearing token');
                        localStorage.removeItem('token');
                    }
                }
            }
        };

        fetchItems();
        fetchFavorites();

        return () => {
            setSelectedType('');
            setSelectedColors([]);
            setSelectedPriceRange(null);
        };

    }, [category, user]);


    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const response = await axios.delete(`http://localhost:5000/api/items/${itemId}`, config);

                // Update the cart count with the returned value
                updateCartCount(response.data.updatedCartCount);

                // Remove the item from the local state
                setItems(items.filter(item => item._id !== itemId));
                alert('Item deleted successfully');
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Failed to delete item. Please try again later.');
            }
        }
    };

    const handleToggleFavorite = async (itemId) => {
        if (!user) {
            alert('Please log in to add items to favorites.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            if (favorites.includes(itemId)) {
                await axios.delete(`http://localhost:5000/api/users/favorites/${itemId}`, config);
                setFavorites(favorites.filter(id => id !== itemId));
            } else {
                await axios.post('http://localhost:5000/api/users/favorites', { itemId }, config);
                setFavorites([...favorites, itemId]);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Failed to update favorites. Please try again later.');
        }
    };

    const filteredItems = items.filter(item => {
        const typeMatch = selectedType === '' || item.type === selectedType;
        const priceMatch = selectedPriceRange === null ||
            (item.price >= priceRanges[selectedPriceRange].min &&
                item.price <= priceRanges[selectedPriceRange].max);
        const colorMatch = selectedColors.length === 0 ||
            (item.color && selectedColors.some(color =>
                item.color.toLowerCase().split(',').map(c => c.trim()).includes(color.toLowerCase())
            ));
        return typeMatch && priceMatch && colorMatch;
    });


    if (loading) return <div className="item-list loading">Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className={`item-list-container ${isShopPage ? 'shop-page' : ''}`}>
            {!isShopPage && (
                <div className="filter-sidebar-list">
                    <FilterSidebar
                        types={types}
                        colors={colors}
                        selectedType={selectedType}
                        selectedColors={selectedColors}
                        onTypeSelect={setSelectedType}
                        onColorSelect={setSelectedColors}
                        selectedPriceRange={selectedPriceRange}
                        onPriceRangeSelect={setSelectedPriceRange}
                    />
                </div>
            )}
            <div className="item-list">
                <h2>{category.charAt(0).toUpperCase() + category.slice(1)} Items</h2>
                {filteredItems.length === 0 ? (
                    <p>No items found matching the selected criteria.</p>
                ) : (
                    <div className="items-grid">
                        {filteredItems.map((item) => (
                            <div key={item._id} className="item-card-list">
                                {item.isActive ? (
                                    <>
                                        <div className="image-container">
                                            <Link to={`/item/${item._id}`}>
                                                <img src={item.image} alt={item.name} />
                                            </Link>
                                            {item.totalStock === 0 && (
                                                <div className="out-of-stock-overlay">OUT OF STOCK</div>
                                            )}
                                        </div>
                                        <h3>{item.name}</h3>
                                        <p>${item.price.toFixed(2)}</p>
                                        <button
                                            className="favorite-btn-list"
                                            onClick={() => handleToggleFavorite(item._id)}
                                        >
                                            {favorites.includes(item._id) ? '❤️' : '🤍'}
                                        </button>
                                        {user && user.isAdmin && (
                                            <button className="delete-item" onClick={() => handleDeleteItem(item._id)}>Delete Item</button>
                                        )}
                                    </>
                                ) : (
                                    <p>This item is no longer available.</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemList;
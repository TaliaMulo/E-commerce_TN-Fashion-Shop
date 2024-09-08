import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './SearchResults.css';
const SearchResults = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { searchTerm } = useParams();
    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/items/search/${searchTerm}`);
                setItems(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching search results:', error);
                setError('Failed to fetch search results. Please try again later.');
                setLoading(false);
            }
        };
        fetchSearchResults();
    }, [searchTerm]);
    if (loading) return <div className="search-resultes loading">Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="search-results">
            <h2>Search Results for "{searchTerm}"</h2>
            {items.length === 0 ? (
                <p>No items found for your search.</p>
            ) : (
                <div className="item-grid-search">
                    {items.map(item => (
                        <Link to={`/item/${item._id}`} key={item._id} className="item-card-search">
                            <img src={item.image} alt={item.name} />
                            <h3>{item.name}</h3>
                            <p>${item.price}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
export default SearchResults;
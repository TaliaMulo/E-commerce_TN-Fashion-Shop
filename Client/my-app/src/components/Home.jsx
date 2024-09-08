import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
    const [randomItems, setRandomItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top
    }, []);

    useEffect(() => {
        const fetchRandomItems = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/items/random/5');
                setRandomItems(response.data.slice(0, 5)); // Ensure we only use 5 items
                setLoading(false);
            } catch (error) {
                console.error('Error fetching random items:', error);
                setError('Failed to fetch random items. Please try again later.');
                setLoading(false);
            }
        };

        fetchRandomItems();
    }, []);

    const categories = ['Men', 'Women', 'Kids'];

    return (
        <div className="home-container">
            <div className="moving-caption">
                <span className="moving-caption-text">
                    🎉 GET 15% OFF! by entering coupon: TN15 🎉
                </span>
                <span className="moving-caption-text">
                    📦 FREE SHIPPING on purchases over $60 📦
                    <span className="spacing"></span>
                </span>

            </div>
            <section className="home">
                <h1>Welcome to FashionShop</h1>
                <p>Where fashion meets passion, find your unique style at our boutique.</p>
            </section>

            <section className="our-items">
                <h2>Some Of Our Items...</h2>
                {loading ? (
                    <p>Loading new collection...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <div className="random-items">
                        {randomItems.map((item) => (
                            <Link to={`/item/${item._id}`} key={item._id} className="random-item">
                                <img src={item.image} alt={item.name} />
                                <h3>{item.name}</h3>
                                <p>${item.price.toFixed(2)}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="categories-home">
                <h2>Shop by Category</h2>
                <div className="category-grid">
                    {categories.map((category) => (
                        <Link to={`/category/${category.toLowerCase()}`} key={category} className="category-card">
                            <h3>{category}</h3>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="about-us">
                <h2>About FashionShop</h2>
                <p>FashionShop is your one-stop destination for all your fashion needs. We offer a wide range of clothing and shoes for men, women, and kids, ensuring that you stay stylish and comfortable.</p>
            </section>
        </div>
    );
};

export default Home;
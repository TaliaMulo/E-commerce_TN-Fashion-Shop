import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../AuthContext';
import './Navbar.css';
import logo from './Assets/logo7.png';
import cart_icon from './Assets/shopping-cart2.png';
import favorite_icon from './Assets/love.png';
import add_icon from './Assets/add.png';
import logout_icon from './Assets/logout.png';
import login_icon from './Assets/login-avatar.png';
import search_icon from './Assets/search2.png';
import my_details_icon from './Assets/id-card.png'

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout, cartCount, fetchCartCount } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const location = useLocation();

    useEffect(() => {
        if (user) {
            fetchCartCount();
        }
    }, [user, fetchCartCount, location]);

    const handleCategoryClick = (category) => {
        if (category.toLowerCase() === 'home') {
            navigate('/');
        } else {
            navigate(`/category/${category.toLowerCase()}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search/${searchTerm}`);
            setSearchTerm('');
        }
    };

    return (
        <div className='navbar'>
            <div className="nav-content">
                <div className="nav-left">
                    <div className="nav_logo">
                        <img src={logo} alt="" />
                        <div className="nav-logo-text">
                            <p>Fashion Shop</p>
                            {user && <div className="nav-welcome">Welcome, {user.name}!</div>}
                        </div>
                    </div>
                </div>
                <div className="nav-center">
                    <ul className="nav-menu">
                        {['Home', 'Men', 'Women', 'Kids'].map((category) => (
                            <li key={category} onClick={() => handleCategoryClick(category)}>
                                {category}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="nav-right">
                    <div className="nav-actions">
                        <div className="nav-login-cart">
                            {user ? (
                                <>
                                    <Link to="/cart">
                                        <button className="icon-button cart-button">
                                            <img src={cart_icon} alt="Cart" />
                                            <span className="nav-cart-count">{cartCount}</span>
                                        </button>
                                    </Link>
                                    <Link to="/favorites">
                                        <button className="icon-button">
                                            <img src={favorite_icon} alt="Favorites" />
                                        </button>
                                    </Link>
                                    {user.isAdmin && (
                                        <Link to="/add-item">
                                            <button className="icon-button">
                                                <img src={add_icon} alt="Add Item" />
                                            </button>
                                        </Link>
                                    )}
                                    <Link to="/my-details">
                                        <button className="icon-button">
                                            <img src={my_details_icon} alt="My Details" />
                                        </button>
                                    </Link>
                                    <button className="icon-button" onClick={handleLogout}>
                                        <img src={logout_icon} alt="Logout" />
                                    </button>
                                </>
                            ) : (
                                <Link to="/login">
                                    <button className="icon-button">
                                        <img src={login_icon} alt="Login" />
                                    </button>
                                </Link>
                            )}
                        </div>
                        <form className="nav-search" onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit">
                                <img src={search_icon} alt="Search" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
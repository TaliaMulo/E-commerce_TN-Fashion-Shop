import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchCartCount();
    }, []);

    const fetchCartCount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await axios.get('http://localhost:5000/api/cart/get-cart', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCartCount(response.data.cartCount);
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    };

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        fetchCartCount();
    };

    const logout = () => {
        setUser(null);
        setCartCount(0);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };


    const updateCartCount = (newCount) => {
        if (typeof newCount === 'function') {
            setCartCount(prevCount => {
                const updatedCount = newCount(prevCount);
                return Math.max(0, updatedCount); // Ensure count doesn't go below 0
            });
        } else {
            setCartCount(Math.max(0, newCount)); // Ensure count doesn't go below 0
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, cartCount, updateCartCount, fetchCartCount }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
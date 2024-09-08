import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './EditItem.css';
import remove_icon from './Assets/close1.png'


const EditItem = () => {
    const [item, setItem] = useState({
        name: '',
        category: '',
        type: '',
        image: '',
        sizeStock: [{ size: '', stock: 0 }],
        price: '',
        color: ''
    });
    const [error, setError] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const response = await axios.get(`http://localhost:5000/api/items/${id}`, config);
                setItem(response.data);
            } catch (error) {
                console.error('Error fetching item:', error);
                setError('Failed to fetch item details. Please try again later.');
            }
        };

        fetchItem();
    }, [id]);

    const handleChange = (e) => {
        setItem({ ...item, [e.target.name]: e.target.value });
    };

    const handleSizeStockChange = (index, field, value) => {
        const newSizeStock = [...item.sizeStock];
        newSizeStock[index][field] = value;
        setItem({ ...item, sizeStock: newSizeStock });
    };

    const addSizeStock = () => {
        setItem({
            ...item,
            sizeStock: [...item.sizeStock, { size: '', stock: 0 }]
        });
    };

    const removeSizeStock = (index) => {
        const newSizeStock = item.sizeStock.filter((_, i) => i !== index);
        setItem({ ...item, sizeStock: newSizeStock });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!user || !user.isAdmin) {
            setError('Access denied. Admin only.');
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

            await axios.put(`http://localhost:5000/api/items/${id}`, item, config);
            alert('Item updated successfully');
            navigate(`/item/${id}`);
        } catch (error) {
            console.error('Error updating item:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'An error occurred while updating the item');
        }
    };

    if (!user || !user.isAdmin) {
        return <div>Access denied. Admin only.</div>;
    }

    return (
        <div className="edit-item-container">
            <h2>Edit Item</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Item Name" value={item.name} onChange={handleChange} required />
                <input type="text" name="category" placeholder="Category" value={item.category} onChange={handleChange} required />
                <input type="text" name="type" placeholder="Type" value={item.type} onChange={handleChange} required />
                <input type="text" name="image" placeholder="Image URL" value={item.image} onChange={handleChange} required />
                <input type="number" name="price" placeholder="Price" value={item.price} onChange={handleChange} required step="0.01" />
                <input type="text" name="color" placeholder="Color" value={item.color} onChange={handleChange} required />
                <div className="size-and-stock-edit">
                    <h3>Sizes and Stock</h3>
                    <button type="button" onClick={addSizeStock}>+ Add Size</button>
                </div>
                {item.sizeStock.map((sizeStock, index) => (
                    <div key={index} className="size-stock-input-edit">
                        <input
                            type="text"
                            value={sizeStock.size}
                            onChange={(e) => handleSizeStockChange(index, 'size', e.target.value)}
                            placeholder="Size"
                            required
                        />
                        <input
                            type="number"
                            value={sizeStock.stock}
                            onChange={(e) => handleSizeStockChange(index, 'stock', parseInt(e.target.value))}
                            placeholder="Stock"
                            min="0"
                            required
                        />
                        {index > 0 && (
                            <button type="button" onClick={() => removeSizeStock(index)} className="icon-button">
                                <img src={remove_icon} alt="Remove" className="icon" />
                            </button>
                        )}
                    </div>
                ))}

                <button className="update-button" type="submit">Update Item</button>
            </form>
        </div>
    );
};

export default EditItem;
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './AddItem.css';
import remove_icon from './Assets/close1.png'

const AddItem = () => {
    const [itemData, setItemData] = useState({
        name: '',
        category: '',
        type: '',
        image: '',
        sizeStock: [{ size: '', stock: 0 }],
        price: '',
        color: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleChange = (e) => {
        setItemData({ ...itemData, [e.target.name]: e.target.value });
    };

    const handleSizeStockChange = (index, field, value) => {
        const newSizeStock = [...itemData.sizeStock];
        newSizeStock[index][field] = value;
        setItemData({ ...itemData, sizeStock: newSizeStock });
    };

    const addSizeStock = () => {
        setItemData({
            ...itemData,
            sizeStock: [...itemData.sizeStock, { size: '', stock: 0 }]
        });
    };

    const removeSizeStock = (index) => {
        const newSizeStock = itemData.sizeStock.filter((_, i) => i !== index);
        setItemData({ ...itemData, sizeStock: newSizeStock });
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

            await axios.post('http://localhost:5000/api/items/add', itemData, config);
            alert('Item added successfully');
            navigate('/');
        } catch (error) {
            console.error('Error adding item:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'An error occurred while adding the item');
        }
    };

    if (!user || !user.isAdmin) {
        return <div>Access denied. Admin only.</div>;
    }

    return (
        <div className="add-item-container">
            <h2>Add New Item</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Item Name" value={itemData.name} onChange={handleChange} required />
                <input type="text" name="category" placeholder="Category" value={itemData.category} onChange={handleChange} required />
                <input type="text" name="type" placeholder="Type" value={itemData.type} onChange={handleChange} required />
                <input type="text" name="image" placeholder="Image URL" value={itemData.image} onChange={handleChange} required />
                <input type="number" name="price" placeholder="Price" value={itemData.price} onChange={handleChange} required />
                <input type="text" name="color" placeholder="Colors (comma-separated)" value={itemData.color} onChange={handleChange} required />
                <div className="size-and-stock-add">
                    <h3>Sizes and Stock</h3>
                    <button type="button" onClick={addSizeStock}>+ Add Size</button>
                </div>
                {itemData.sizeStock.map((sizeStock, index) => (
                    <div key={index} className="size-stock-input-add">
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


                <button className="submit-button" type="submit">Add Item</button>
            </form>
        </div>
    );
};

export default AddItem;
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import ItemList from './components/ItemList';
import ItemDetails from './components/ItemDetails';
import Cart from './components/Cart';
import AddItem from './components/AddItem';
import EditItem from './components/EditItem';
import SearchResults from './components/SearchResults';
import FavoriteList from './components/FavoriteList';
import Home from './components/Home';
import Checkout from './components/Checkout';
import { AuthProvider } from './AuthContext';
import UserDetailsPage from './components/UserDetailsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/category/:category" element={<ItemList />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/edit-item/:id" element={<EditItem />} />
            <Route path="/search/:searchTerm" element={<SearchResults />} />
            <Route path="/favorites" element={<FavoriteList />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-details" element={<UserDetailsPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

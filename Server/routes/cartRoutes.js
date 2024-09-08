const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const cartController = require('../controllers/cartController');

router.get('/get-cart', authMiddleware, cartController.getCart);
router.put('/update-item', authMiddleware, cartController.updateCartItem);
router.delete('/delete-item/:itemId', authMiddleware, cartController.deleteCartItem);

module.exports = router;

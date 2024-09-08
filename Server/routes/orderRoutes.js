const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const orderController = require('../controllers/orderController');

router.post('/create', authMiddleware, orderController.createOrder);
router.get('/user-orders', authMiddleware, orderController.getUserOrders);

module.exports = router;
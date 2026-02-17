const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { query } = require('../db');
const { protect, admin } = require('../middleware/authMiddleware');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// @route   GET /api/subscription/plans
// @desc    Get all active subscription plans
// @access  Public
router.get('/plans', async (req, res) => {
    try {
        const result = await query('SELECT * FROM subscription_plans WHERE is_active = TRUE');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/subscription/plans
// @desc    Create a new plan
// @access  Admin
router.post('/plans', protect, admin, async (req, res) => {
    const { name, duration_hours, price } = req.body;
    try {
        const result = await query(
            'INSERT INTO subscription_plans (name, duration_hours, price) VALUES ($1, $2, $3) RETURNING *',
            [name, duration_hours, price]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/subscription/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
    const { planId } = req.body;
    try {
        const planResult = await query('SELECT * FROM subscription_plans WHERE id = $1', [planId]);
        if (planResult.rows.length === 0) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        const plan = planResult.rows[0];

        const options = {
            amount: plan.price * 100, // amount in smallest currency unit check (paise)
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}_${req.user.id}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/subscription/verify-payment
// @desc    Verify Razorpay payment and activate subscription
// @access  Private
router.post('/verify-payment', protect, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder');
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
        // Payment success
        try {
            const planResult = await query('SELECT * FROM subscription_plans WHERE id = $1', [planId]);
            const plan = planResult.rows[0];

            // Record payment
            await query(
                'INSERT INTO payments (user_id, razorpay_order_id, razorpay_payment_id, amount, status) VALUES ($1, $2, $3, $4, $5)',
                [req.user.id, razorpay_order_id, razorpay_payment_id, plan.price, 'captured']
            );

            // Activate subscription
            const expiry = new Date();
            expiry.setHours(expiry.getHours() + plan.duration_hours);

            await query(
                'UPDATE users SET is_premium = TRUE, premium_expiry = $1 WHERE id = $2',
                [expiry, req.user.id]
            );

            res.json({ message: 'Payment verified and subscription activated' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    } else {
        res.status(400).json({ message: 'Invalid signature' });
    }
});

module.exports = router;

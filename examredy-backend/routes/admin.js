const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, admin } = require('../middleware/authMiddleware');

// Middleware to ensure admin
router.use(protect, admin);

// @route   GET /api/admin/stats
// @desc    Get dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const users = await query('SELECT COUNT(*) FROM users');
        const premiumUsers = await query('SELECT COUNT(*) FROM users WHERE is_premium = TRUE');
        const revenue = await query('SELECT SUM(amount) FROM payments WHERE status = \'captured\'');

        res.json({
            totalUsers: parseInt(users.rows[0]?.count || 0),
            premiumUsers: parseInt(premiumUsers.rows[0]?.count || 0),
            totalRevenue: parseFloat(revenue.rows[0]?.sum || 0)
        });
    } catch (error) {
        console.error('Admin Stats Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
});

// @route   GET /api/admin/settings
// @desc    Get system settings
router.get('/settings', async (req, res) => {
    try {
        const result = await query('SELECT * FROM system_settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/settings
// @desc    Update system settings
router.put('/settings', async (req, res) => {
    const settings = req.body; // { FREE_DAILY_LIMIT: 5, ... }

    try {
        for (const [key, value] of Object.entries(settings)) {
            await query(
                'INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
                [key, String(value)]
            );
        }
        res.json({ message: 'Settings updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/categories
// @desc    Add new category
router.post('/categories', async (req, res) => {
    const { name, image_url, description, sort_order } = req.body;
    try {
        const result = await query(
            'INSERT INTO categories (name, image_url, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, image_url, description, sort_order || 0]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users (paginated)
router.get('/users', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const result = await query(
            'SELECT id, username, email, role, is_premium, created_at FROM users ORDER BY created_at DESC OFFSET $1 LIMIT $2',
            [offset, limit]
        );
        const count = await query('SELECT COUNT(*) FROM users');

        res.json({
            users: result.rows,
            totalPages: Math.ceil(count.rows[0].count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

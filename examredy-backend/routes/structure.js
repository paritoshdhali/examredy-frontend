const express = require('express');
const router = express.Router();
const { query } = require('../db');

// @route   GET /api/structure/categories
// @desc    Get all active categories
router.get('/categories', async (req, res) => {
    try {
        const result = await query('SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

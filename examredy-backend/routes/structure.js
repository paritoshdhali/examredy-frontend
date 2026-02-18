const express = require('express');
const router = express.Router();
const { query } = require('../db');

// Helper to return empty instead of 500 if no data
const safeFetch = async (q, params, res) => {
    try {
        const result = await query(q, params);
        res.json(result.rows);
    } catch (error) {
        console.error(`Structure Fetch Error: ${q}`, error.message);
        res.status(500).json({ message: 'Server error', data: [] });
    }
};

// @route   GET /api/structure/categories
router.get('/categories', (req, res) => safeFetch('SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order ASC', [], res));

// @route   GET /api/structure/states
router.get('/states', (req, res) => safeFetch('SELECT * FROM states ORDER BY name ASC', [], res));

// @route   GET /api/structure/languages
router.get('/languages', (req, res) => safeFetch('SELECT * FROM languages ORDER BY name ASC', [], res));

// @route   GET /api/structure/classes
router.get('/classes', (req, res) => safeFetch('SELECT * FROM classes ORDER BY name ASC', [], res));

// @route   GET /api/structure/boards/:state_id
router.get('/boards/:state_id', (req, res) => safeFetch('SELECT * FROM boards WHERE state_id = $1', [req.params.state_id], res));

// @route   GET /api/structure/streams
router.get('/streams', (req, res) => safeFetch('SELECT * FROM streams ORDER BY name ASC', [], res));

// @route   GET /api/structure/subjects
router.get('/subjects', (req, res) => {
    const { board_id, class_id, stream_id } = req.query;
    let q = 'SELECT * FROM subjects WHERE 1=1';
    const params = [];
    if (board_id) { params.push(board_id); q += ` AND board_id = $${params.length}`; }
    if (class_id) { params.push(class_id); q += ` AND class_id = $${params.length}`; }
    if (stream_id) { params.push(stream_id); q += ` AND stream_id = $${params.length}`; }
    safeFetch(q, params, res);
});

// @route   GET /api/structure/chapters/:subject_id
router.get('/chapters/:subject_id', (req, res) => safeFetch('SELECT * FROM chapters WHERE subject_id = $1', [req.params.subject_id], res));

module.exports = router;

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, admin } = require('../middleware/authMiddleware');
const { generateMCQInitial } = require('../services/aiService');
const { subscriptionCheck } = require('../middleware/subscriptionMiddleware');

// @route   POST /api/mcq/generate
// @desc    Generate MCQs using AI (Admin only)
// @access  Admin
router.post('/generate', protect, admin, async (req, res) => {
    const { topic, category_id, count } = req.body;
    try {
        const mcqs = await generateMCQInitial(topic, count || 5);

        // Save to DB
        const savedMcqs = [];
        for (const mcq of mcqs) {
            const result = await query(
                'INSERT INTO mcq_pool (question, options, correct_option, explanation, category_id, subject, chapter, is_approved) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                [mcq.question, JSON.stringify(mcq.options), mcq.correct_option, mcq.explanation, category_id, mcq.subject, mcq.chapter, false] // Default not approved
            );
            savedMcqs.push(result.rows[0]);
        }

        res.json(savedMcqs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'AI generation failed' });
    }
});

// @route   GET /api/mcq/practice
// @desc    Get MCQs for practice
// @access  Private (with limits)
router.get('/practice', protect, subscriptionCheck, async (req, res) => {
    const { category_id, limit = 10 } = req.query;

    try {
        // Free user check
        if (!req.isPremium && req.isPremium !== undefined) {
            // Check daily usage
            const usageResult = await query('SELECT count FROM user_daily_usage WHERE user_id = $1 AND date = CURRENT_DATE', [req.user.id]);
            const dailyCount = usageResult.rows.length > 0 ? usageResult.rows[0].count : 0;
            const settingsResult = await query('SELECT value FROM system_settings WHERE key = \'FREE_DAILY_LIMIT\'');
            const freeLimit = parseInt(settingsResult.rows[0].value);

            if (dailyCount >= freeLimit) {
                return res.status(403).json({ message: 'Daily free limit reached', code: 'LIMIT_REACHED' });
            }
        }

        // Fetch MCQs (Random for now)
        const result = await query(
            'SELECT id, question, options, subject, chapter FROM mcq_pool WHERE category_id = $1 AND is_approved = TRUE ORDER BY RANDOM() LIMIT $2',
            [category_id, limit]
        );

        // Increment usage if not premium
        if (!req.isPremium && req.isPremium !== undefined) {
            await query(`
                INSERT INTO user_daily_usage (user_id, date, count)
                VALUES ($1, CURRENT_DATE, 1)
                ON CONFLICT (user_id, date)
                DO UPDATE SET count = user_daily_usage.count + 1
             `, [req.user.id]);
        }

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/mcq/submit
// @desc    Submit answer and get result
// @access  Private
router.post('/submit', protect, async (req, res) => {
    const { mcq_id, selected_option } = req.body;

    try {
        const result = await query('SELECT * FROM mcq_pool WHERE id = $1', [mcq_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'MCQ not found' });
        }

        const mcq = result.rows[0];
        const isCorrect = mcq.correct_option === selected_option;

        // Save history
        await query(
            'INSERT INTO user_mcq_history (user_id, mcq_id, is_correct) VALUES ($1, $2, $3)',
            [req.user.id, mcq_id, isCorrect]
        );

        // Update usage if free user? (Logic might be on fetching session, but let's track here too if needed, usually on session start)
        // Only increment usage on fetching new session to avoid double counting

        res.json({
            is_correct: isCorrect,
            explanation: mcq.explanation,
            correct_option: mcq.correct_option
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

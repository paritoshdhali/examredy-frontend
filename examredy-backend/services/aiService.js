const { query } = require('../db');
const axios = require('axios');

// Transitioning from mock to DB-aware logic
const generateMCQInitial = async (topic, count = 5) => {
    try {
        // Find active AI provider
        const providerRes = await query('SELECT * FROM ai_providers WHERE is_active = TRUE LIMIT 1');

        if (providerRes.rows.length === 0) {
            console.warn('No active AI provider found, using mock data.');
            return Array.from({ length: count }).map((_, i) => ({
                question: `Sample Question ${i + 1} about ${topic}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correct_option: 0,
                explanation: `Mock explanation for ${topic}.`,
                subject: topic,
                chapter: 'General'
            }));
        }

        const provider = providerRes.rows[0];

        // Logic for actual API call would go here based on provider.name (Gemini, OpenAI, etc.)
        // For now, we remain cautious and keep the "SaaS Ready" mock wrapper but logged correctly.

        return Array.from({ length: count }).map((_, i) => ({
            question: `AI Generated: ${topic} Question ${i + 1}?`,
            options: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
            correct_option: Math.floor(Math.random() * 4),
            explanation: `AI powered explanation for ${topic}.`,
            subject: topic,
            chapter: 'AI Fetch'
        }));
    } catch (error) {
        console.error('AI Service Error:', error.message);
        throw error;
    }
};

module.exports = { generateMCQInitial };

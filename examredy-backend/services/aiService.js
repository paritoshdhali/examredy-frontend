// Simulate AI Service for now, replacing with actual API call (OpenAI/Gemini)
const generateMCQInitial = async (topic, count = 1) => {
    // This is a mock response. In production, use axios to call OpenAI/Gemini API.
    return Array.from({ length: count }).map((_, i) => ({
        question: `Sample Question ${i + 1} about ${topic}?`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct_option: 0,
        explanation: `Explanation for question ${i + 1} about ${topic}.`,
        subject: topic,
        chapter: 'General'
    }));
};

module.exports = { generateMCQInitial };

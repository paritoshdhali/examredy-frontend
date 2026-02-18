const { Pool } = require('pg');
require('dotenv').config();

// Production-ready configuration for Railway
// STRICTLY use DATABASE_URL and SSL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20, // Connection pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Handle unexpected errors on idle clients to prevent crashing
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client (PostgreSQL):', err);
    // Don't exit process, just log. Pool handles reconnection.
});

// Helper for running queries
const query = (text, params) => pool.query(text, params);

// Connection verification
const testConnection = async () => {
    let client;
    try {
        client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        console.log('✅ PostgreSQL Connected Successfully at:', res.rows[0].now);
        return true;
    } catch (err) {
        console.error('❌ PostgreSQL Connection Failed:', err.message);
        return false;
    } finally {
        if (client) client.release();
    }
};

// Auto-create tables logic
const initDB = async () => {
    try {
        console.log('Initializing/Verifying Database Tables...');

        // System Settings
        await query(`CREATE TABLE IF NOT EXISTS system_settings (key VARCHAR(50) PRIMARY KEY, value TEXT NOT NULL);`);
        const defaults = { 'FREE_DAILY_LIMIT': '2', 'FREE_LIMIT_WINDOW_HOURS': '24', 'GROUP_SIZE_LIMIT': '10', 'MCQ_PER_SESSION': '10' };
        for (const [key, value] of Object.entries(defaults)) {
            await query(`INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING;`, [key, value]);
        }

        // Users
        await query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(100) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(20) DEFAULT 'user', is_premium BOOLEAN DEFAULT FALSE, premium_expiry TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // User Daily Usage
        await query(`CREATE TABLE IF NOT EXISTS user_daily_usage (user_id INTEGER REFERENCES users(id), date DATE DEFAULT CURRENT_DATE, count INTEGER DEFAULT 0, PRIMARY KEY (user_id, date));`);

        // Categories
        await query(`CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL, image_url TEXT, description TEXT, is_active BOOLEAN DEFAULT TRUE, sort_order INTEGER DEFAULT 0);`);
        const cats = ['School', 'University', 'UPSC', 'CTET', 'SSC', 'Banking', 'Railway', 'State Govt', 'Others'];
        for (let i = 0; i < cats.length; i++) {
            await query(`INSERT INTO categories (name, sort_order) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING;`, [cats[i], i]);
        }

        // Subscriptions
        await query(`CREATE TABLE IF NOT EXISTS subscription_plans (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL, duration_hours INTEGER NOT NULL, price DECIMAL(10, 2) NOT NULL, is_active BOOLEAN DEFAULT TRUE);`);
        await query(`INSERT INTO subscription_plans (name, duration_hours, price) VALUES ('1 Hour Pass', 1, 10), ('3 Hour Pass', 3, 25) ON CONFLICT DO NOTHING;`);

        // Payments
        await query(`CREATE TABLE IF NOT EXISTS payments (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), razorpay_order_id VARCHAR(100), razorpay_payment_id VARCHAR(100), amount DECIMAL(10, 2), status VARCHAR(20), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // Referrals
        await query(`CREATE TABLE IF NOT EXISTS referrals (id SERIAL PRIMARY KEY, referrer_id INTEGER REFERENCES users(id), referred_user_id INTEGER REFERENCES users(id), status VARCHAR(20) DEFAULT 'pending', reward_given BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // Content Hierarchy
        await query(`CREATE TABLE IF NOT EXISTS states (id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL);`);
        await query(`CREATE TABLE IF NOT EXISTS boards (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, state_id INTEGER REFERENCES states(id));`);
        await query(`CREATE TABLE IF NOT EXISTS classes (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL);`);
        await query(`CREATE TABLE IF NOT EXISTS streams (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL);`);
        await query(`CREATE TABLE IF NOT EXISTS subjects (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, board_id INTEGER REFERENCES boards(id), class_id INTEGER REFERENCES classes(id), stream_id INTEGER REFERENCES streams(id));`);
        await query(`CREATE TABLE IF NOT EXISTS chapters (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, subject_id INTEGER REFERENCES subjects(id));`);

        // NEW: Languages
        await query(`CREATE TABLE IF NOT EXISTS languages (id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE);`);

        // NEW: AI Providers
        await query(`CREATE TABLE IF NOT EXISTS ai_providers (id SERIAL PRIMARY KEY, name VARCHAR(100), base_url TEXT, api_key TEXT, model_name TEXT, is_active BOOLEAN DEFAULT TRUE);`);

        // NEW: AI Fetch Logs
        await query(`CREATE TABLE IF NOT EXISTS ai_fetch_logs (id SERIAL PRIMARY KEY, fetch_type VARCHAR(100), reference_id INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // Ads
        await query(`CREATE TABLE IF NOT EXISTS ads_settings (id SERIAL PRIMARY KEY, location VARCHAR(50), script_content TEXT, is_active BOOLEAN DEFAULT TRUE);`);

        // MCQ Pool with Duplicate Prevention
        await query(`
            CREATE TABLE IF NOT EXISTS mcq_pool (
                id SERIAL PRIMARY KEY, 
                question TEXT NOT NULL, 
                options JSONB NOT NULL, 
                correct_option INTEGER NOT NULL, 
                explanation TEXT, 
                category_id INTEGER REFERENCES categories(id), 
                subject VARCHAR(100), 
                chapter VARCHAR(100), 
                difficulty VARCHAR(20) DEFAULT 'medium', 
                is_approved BOOLEAN DEFAULT FALSE, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // CRITICAL: Add question_hash if it doesn't exist
        await query(`ALTER TABLE mcq_pool ADD COLUMN IF NOT EXISTS question_hash VARCHAR(64);`);
        // CRITICAL: Add Unique Index on hash
        await query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_question_hash_unique ON mcq_pool(question_hash);`);

        // History
        await query(`CREATE TABLE IF NOT EXISTS user_mcq_history (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), mcq_id INTEGER REFERENCES mcq_pool(id), is_correct BOOLEAN, attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // Groups
        await query(`CREATE TABLE IF NOT EXISTS group_sessions (id VARCHAR(50) PRIMARY KEY, creator_id INTEGER REFERENCES users(id), is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        await query(`CREATE TABLE IF NOT EXISTS group_participants (id SERIAL PRIMARY KEY, session_id VARCHAR(50) REFERENCES group_sessions(id), user_id INTEGER REFERENCES users(id), score INTEGER DEFAULT 0, joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

        // PERFORMANCE INDEXES
        await query(`CREATE INDEX IF NOT EXISTS idx_mcq_subject ON mcq_pool(subject);`); // Assuming subject is stored as string for now based on previous schema, ideal is foreign key
        await query(`CREATE INDEX IF NOT EXISTS idx_mcq_category ON mcq_pool(category_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_user_usage ON user_daily_usage(user_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);`);

        console.log('✅ All Database Tables Verified/Created & Indexes Applied');
    } catch (err) {
        console.error('❌ Error initializing database tables:', err);
    }
};

module.exports = { pool, query, initDB };

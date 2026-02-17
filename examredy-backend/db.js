const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'examredy',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

const connectDB = async () => {
    try {
        await pool.connect();
        console.log('PostgreSQL Connected Successfully');
    } catch (err) {
        console.error('PostgreSQL Connection Failed:', err.message);
        process.exit(1);
    }
};

const query = (text, params) => pool.query(text, params);

// Auto-create tables logic
const initDB = async () => {
    try {
        console.log('Initializing Database Tables...');

        // System Settings
        await query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                key VARCHAR(50) PRIMARY KEY,
                value TEXT NOT NULL
            );
        `);

        // Insert default settings if not exists
        const defaults = {
            'FREE_DAILY_LIMIT': '2',
            'FREE_LIMIT_WINDOW_HOURS': '24',
            'GROUP_SIZE_LIMIT': '10',
            'MCQ_PER_SESSION': '10'
        };

        for (const [key, value] of Object.entries(defaults)) {
            await query(`
                INSERT INTO system_settings (key, value)
                VALUES ($1, $2)
                ON CONFLICT (key) DO NOTHING;
            `, [key, value]);
        }

        // Users
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user', -- user, admin
                is_premium BOOLEAN DEFAULT FALSE,
                premium_expiry TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // User Daily Usage
        await query(`
            CREATE TABLE IF NOT EXISTS user_daily_usage (
                user_id INTEGER REFERENCES users(id),
                date DATE DEFAULT CURRENT_DATE,
                count INTEGER DEFAULT 0,
                PRIMARY KEY (user_id, date)
            );
        `);

        // Categories (Horizontal Scroll)
        await query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                image_url TEXT,
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                sort_order INTEGER DEFAULT 0
            );
        `);

        // Insert default categories
        const defaultCategories = [
            'School', 'University', 'UPSC', 'CTET', 'SSC',
            'Banking', 'Railway', 'State Govt', 'Others'
        ];

        for (let i = 0; i < defaultCategories.length; i++) {
            await query(`
                INSERT INTO categories (name, sort_order)
                VALUES ($1, $2)
                ON CONFLICT (name) DO NOTHING;
            `, [defaultCategories[i], i]);
        }

        // Subscription Plans
        await query(`
            CREATE TABLE IF NOT EXISTS subscription_plans (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                duration_hours INTEGER NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE
            );
        `);

        // Insert default plans
        await query(`
            INSERT INTO subscription_plans (name, duration_hours, price)
            VALUES 
            ('1 Hour Pass', 1, 10),
            ('3 Hour Pass', 3, 25)
            ON CONFLICT DO NOTHING; -- This is basic, might need better checks in real app
        `);

        // Payments
        await query(`
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                razorpay_order_id VARCHAR(100),
                razorpay_payment_id VARCHAR(100),
                amount DECIMAL(10, 2),
                status VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Referrals
        await query(`
            CREATE TABLE IF NOT EXISTS referrals (
                id SERIAL PRIMARY KEY,
                referrer_id INTEGER REFERENCES users(id),
                referred_user_id INTEGER REFERENCES users(id),
                status VARCHAR(20) DEFAULT 'pending', -- pending, completed
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Content Hierarchy
        await query(`
            CREATE TABLE IF NOT EXISTS states (id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL);
            CREATE TABLE IF NOT EXISTS boards (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, state_id INTEGER REFERENCES states(id));
            CREATE TABLE IF NOT EXISTS classes (id SERIAL PRIMARY KEY, name VARCHAR(50) NOT NULL);
            CREATE TABLE IF NOT EXISTS streams (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL);
            CREATE TABLE IF NOT EXISTS subjects (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, board_id INTEGER REFERENCES boards(id), class_id INTEGER REFERENCES classes(id), stream_id INTEGER REFERENCES streams(id));
            CREATE TABLE IF NOT EXISTS chapters (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, subject_id INTEGER REFERENCES subjects(id));
        `);

        // Ads Settings
        await query(`
             CREATE TABLE IF NOT EXISTS ads_settings (
                id SERIAL PRIMARY KEY, 
                location VARCHAR(50), 
                script_content TEXT, 
                is_active BOOLEAN DEFAULT TRUE
            );
        `);

        // MCQ Pool
        await query(`
            CREATE TABLE IF NOT EXISTS mcq_pool (
                id SERIAL PRIMARY KEY,
                question TEXT NOT NULL,
                options JSONB NOT NULL, -- Array of strings
                correct_option INTEGER NOT NULL, -- Index 0-3
                explanation TEXT,
                category_id INTEGER REFERENCES categories(id),
                subject VARCHAR(100),
                chapter VARCHAR(100),
                difficulty VARCHAR(20) DEFAULT 'medium',
                is_approved BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // User MCQ History
        await query(`
            CREATE TABLE IF NOT EXISTS user_mcq_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                mcq_id INTEGER REFERENCES mcq_pool(id),
                is_correct BOOLEAN,
                attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Group Sessions
        await query(`
            CREATE TABLE IF NOT EXISTS group_sessions (
                id VARCHAR(50) PRIMARY KEY, -- Unique Code
                creator_id INTEGER REFERENCES users(id),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Group Participants
        await query(`
            CREATE TABLE IF NOT EXISTS group_participants (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(50) REFERENCES group_sessions(id),
                user_id INTEGER REFERENCES users(id),
                score INTEGER DEFAULT 0,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Database Tables Initialized Successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

module.exports = { pool, query, connectDB, initDB };

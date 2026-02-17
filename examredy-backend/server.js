require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB, initDB } = require('./db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/structure', require('./routes/structure'));
app.use('/api/mcq', require('./routes/mcq'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/group', require('./routes/group'));
app.use('/api/admin', require('./routes/admin'));

// Basic Route
app.get('/', (req, res) => {
    res.send({ message: 'ExamRedy API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await initDB(); // Auto create tables
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();

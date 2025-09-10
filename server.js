const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route files
const auth = require('./routes/auth');
const transactions = require('./routes/transactions');
const budgets = require('./routes/budgets');
const goals = require('./routes/goals');
const reports = require('./routes/reports');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/transactions', transactions);
app.use('/api/budgets', budgets);
app.use('/api/goals', goals);
app.use('/api/reports', reports);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
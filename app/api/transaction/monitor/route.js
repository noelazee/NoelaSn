// route.js

const express = require('express');
const app = express();
const axios = require('axios');

// Middleware to parse JSON
app.use(express.json());

// Function to track USDC transfer status
async function trackUSDCTransfer(transactionId) {
    try {
        const response = await axios.get(`https://api.basechain.com/transaction/${transactionId}`);
        return response.data;
    } catch (error) {
        console.error('Error tracking USDC transfer:', error);
        throw error;
    }
}

// API endpoint for monitoring transfer status
app.get('/track/:transactionId', async (req, res) => {
    const transactionId = req.params.transactionId;
    try {
        const status = await trackUSDCTransfer(transactionId);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve transfer status.' });
    }
});

module.exports = app;
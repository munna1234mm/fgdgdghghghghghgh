const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Root endpoint for API info
app.get('/', (req, res) => {
    let bin = req.query.bin || req.query.url;
    if (bin) return generateCardsHandler(req, res, bin);
    
    res.json({
        name: "Elite BIN Generator API",
        version: "3.0.0",
        usage: "GET /3743551272",
        example: `${req.protocol}://${req.get('host')}/3743551272`,
        status: "active"
    });
});

// SUPER-SIMPLE ROUTE: Just your-api.com/3743551272
app.get('/:bin', (req, res) => {
    const bin = req.params.bin;
    if (bin === 'api') return res.status(404).json({error: "Use /api/gen or just /BIN"});
    generateCardsHandler(req, res, bin);
});

// API Endpoint (Legacy support)
app.get('/api/gen', (req, res) => {
    let bin = req.query.bin || req.query.url;
    generateCardsHandler(req, res, bin);
});

// Shared Handler Logic
function generateCardsHandler(req, res, bin) {
    const amount = parseInt(req.query.amount) || 10;
    const format = req.query.format || 'json';

    if (!bin || bin.length < 6) {
        return res.status(400).json({ error: 'Valid BIN is required (min 6 digits)' });
    }

    // Basic BIN clean
    const cleanBin = bin.toString().split(' ')[0].replace(/[^0-9]/g, '');
    
    const cards = [];
    for (let i = 0; i < amount; i++) {
        const cardNumber = generateCard(cleanBin);
        const expiry = generateExpiry();
        const cvv = generateCVV();
        cards.push(`${cardNumber}|${expiry}|${cvv}`);
    }

    if (format === 'text') {
        res.setHeader('Content-Type', 'text/plain');
        return res.send(cards.join('\n'));
    }

    res.json({
        bin: cleanBin,
        count: amount,
        format: format,
        data: cards
    });
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

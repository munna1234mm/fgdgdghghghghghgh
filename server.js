const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Root endpoint for API info
app.get('/', (req, res) => {
    res.json({
        name: "Elite BIN Generator API",
        version: "2.0.0",
        usage: "/api/gen?bin=XXXXXX&amount=10&format=text/json",
        status: "active"
    });
});

// Luhn Algorithm to validate a card number
function isValidLuhn(number) {
    let sum = 0;
    let isSecond = false;
    for (let i = number.length - 1; i >= 0; i--) {
        let d = parseInt(number.charAt(i), 10);
        if (isSecond) {
            d = d * 2;
            if (d > 9) d -= 9;
        }
        sum += d;
        isSecond = !isSecond;
    }
    return (sum % 10 === 0);
}

// Generate a valid card number based on a BIN
function generateCard(bin) {
    let cleanBin = bin.toString().replace(/[^0-9]/g, '');
    let cardNumber = cleanBin;
    let targetLength = 16;

    // Fill remaining digits except the last one randomly
    while (cardNumber.length < targetLength - 1) {
        cardNumber += Math.floor(Math.random() * 10).toString();
    }

    // Find the last digit that makes the number pass Luhn
    for (let i = 0; i <= 9; i++) {
        let candidate = cardNumber + i;
        if (isValidLuhn(candidate)) {
            return candidate;
        }
    }
    return cardNumber + '0'; // Fallback
}

// Generate random expiry date
function generateExpiry() {
    const month = Math.floor(Math.random() * 12) + 1;
    const year = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;
    return `${month < 10 ? '0' + month : month}|${year}`;
}

// Generate random CVV
function generateCVV() {
    return Math.floor(Math.random() * 900) + 100;
}

// API Endpoint
app.get('/api/gen', (req, res) => {
    let bin = req.query.bin || req.query.url; // Support both 'bin' and 'url' params
    const amount = parseInt(req.query.amount) || 10;
    const format = req.query.format || 'json';

    if (!bin) {
        return res.status(400).json({ error: 'BIN is required' });
    }

    // Basic BIN clean
    bin = bin.toString().split(' ')[0];
    
    const cards = [];
    for (let i = 0; i < amount; i++) {
        const cardNumber = generateCard(bin);
        const expiry = generateExpiry();
        const cvv = generateCVV();
        cards.push(`${cardNumber}|${expiry}|${cvv}`);
    }

    if (format === 'text') {
        res.setHeader('Content-Type', 'text/plain');
        return res.send(cards.join('\n'));
    }

    res.json({
        bin: bin,
        count: amount,
        format: format,
        data: cards
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

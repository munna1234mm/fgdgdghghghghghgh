const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// --- CORE LOGIC ---

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

    while (cardNumber.length < targetLength - 1) {
        cardNumber += Math.floor(Math.random() * 10).toString();
    }

    for (let i = 0; i <= 9; i++) {
        let candidate = cardNumber + i;
        if (isValidLuhn(candidate)) {
            return candidate;
        }
    }
    return cardNumber + '0';
}

function generateExpiry() {
    const month = Math.floor(Math.random() * 12) + 1;
    const year = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;
    return `${month < 10 ? '0' + month : month}|${year}`;
}

function generateCVV() {
    return Math.floor(Math.random() * 900) + 100;
}

// --- API ENDPOINTS ---

// Shared Handler Logic
function generateCardsHandler(req, res, bin) {
    const amount = parseInt(req.query.amount) || 10;
    const format = req.query.format || 'json';

    if (!bin || bin.length < 6) {
        return res.status(400).json({ error: 'Valid BIN is required (min 6 digits)' });
    }

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

// Root endpoint for API info
app.get('/', (req, res) => {
    let bin = req.query.bin || req.query.url;
    if (bin) return generateCardsHandler(req, res, bin);
    
    res.json({
        name: "Elite BIN Generator API",
        version: "4.0.0",
        usage: "GET /3743551272",
        example: `${req.protocol}://${req.get('host')}/3743551272`,
        status: "active"
    });
});

// SUPER-SIMPLE ROUTE: Just your-api.onrender.com/3743551272
app.get('/:bin', (req, res) => {
    const bin = req.params.bin;
    // Avoid interfering with root favicon or other requests
    if (bin.length < 6 || isNaN(bin)) {
         return res.status(400).json({error: "Please provide a valid BIN prefix (min 6 digits)"});
    }
    generateCardsHandler(req, res, bin);
});

// API Endpoint (Legacy support)
app.get('/api/gen', (req, res) => {
    let bin = req.query.bin || req.query.url;
    generateCardsHandler(req, res, bin);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

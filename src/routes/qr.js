const express = require('express');
const QRCode = require('qrcode');
const passport = require('passport');
require('../auth/passportJWT.js');

const router = express.Router();

// GET /qr
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const baseUrl = 'https://ehb-match.me/'
    const userId = req.query.id ? req.query.id : req.user.id;
    if (req.user.type === 2) {
        url = baseUrl + 'student/' + userId;
    } else if (req.user.type === 3) {
        url = baseUrl + 'bedrijf/' + userId;
    }
    if (!url) {
        return res.status(400).json({ error: 'Missing url query parameter' });
    }
    try {
        // Set response type to PNG image
        res.type('png');
        // Pipe QR code PNG stream to response
        QRCode.toFileStream(res, url, { type: 'png' });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

module.exports = router;

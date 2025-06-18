const express = require('express')
const jwt = require('jsonwebtoken');



require('dotenv').config();

const router = express.Router();

router.post('/', (req, res, next) => {
    // Check if request has a refresh token in the body, if not, check cookies
    const refreshToken = req.body && typeof req.body.refreshToken !== 'undefined' ? req.body.refreshToken : req.cookies.refreshToken;

    console.log('Received refresh token:', refreshToken);

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                console.error('Refresh token verification failed:', err);
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            const accessMaxAge = 60; // 15 minutes in seconds [Temporarily set to 1 minute for testing]
            const refreshMaxAge = 7 * 24 * 60 * 60; // 7 days in seconds

            // Generate new access token
            const accessToken = jwt.sign({ id: decoded.id, type: decoded.type }, process.env.JWT_ACCESS_SECRET, { expiresIn: accessMaxAge });

            const accessTokenExpiresAt = new Date(Date.now() + accessMaxAge * 1000).toISOString();
            const refreshTokenExpiresAt = new Date(Date.now() + refreshMaxAge * 1000).toISOString();

            return res.json({ message: 'Token refreshed successfully', accessToken: accessToken, accessTokenExpiresAt: accessTokenExpiresAt, refreshTokenExpiresAt: refreshTokenExpiresAt });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});

module.exports = router;
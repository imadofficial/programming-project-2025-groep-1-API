const express = require('express')
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/', (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    console.log('Received refresh token:', refreshToken);

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            // Generate new access token
            const accessToken = jwt.sign({ id: decoded.id, type: decoded.type }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

            const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
            const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            return res.json({ message: 'Token refreshed successfully', accessToken: accessToken, accessTokenExpiresAt: accessTokenExpiresAt, refreshTokenExpiresAt: refreshTokenExpiresAt });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error: ' + error.message });
    }
});

module.exports = router;
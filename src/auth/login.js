const express = require('express')
const passport = require('passport');
const jwt = require('jsonwebtoken');

require('./passportLocal.js');

const router = express.Router();

router.post('/', async (req, res, next) => {
    await passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error: ' + err.message });
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials', info: info });
        }
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.STATUS === 'production', // Use secure cookies in production
            sameSite: 'Strict', // Adjust as necessary
            path: "/auth/refresh", // Ensure the cookie is only sent to the refresh endpoint
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const accessTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        return res.status(200).json({ message: 'Login successful', accessToken: accessToken, accessTokenExpiresAt: accessTokenExpiresAt, refreshTokenExpiresAt: refreshTokenExpiresAt });
    })(req, res, next);
});

module.exports = router;
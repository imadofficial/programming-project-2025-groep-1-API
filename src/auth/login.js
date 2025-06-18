const express = require('express')
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { getUserInfo } = require('../sql/users.js');

require('./passportLocal.js');

const router = express.Router();

router.post('/', (req, res, next) => {
    console.log("Login request received");
    // Validate request body
    if (!req.body || !req.body.email || !req.body.password) {
        return res.status(400).json({ message: 'Bad request: Missing email or password' });
    }

    // Validate email format
    req.body.email = req.body.email.toLowerCase(); // Normalize email to lowercase
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ message: 'Bad request: Invalid email format' });
    }

    // Validate password format (string)
    if (typeof req.body.password !== 'string') {
        return res.status(400).json({ message: 'Bad request: Password must be a string' });
    }

    // Validate password length
    if (req.body.password.length < 8) {
        return res.status(400).json({ message: 'Bad request: Password must be at least 8 characters long' });
    }

    // Use passport to authenticate the user
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error: ' + err.message });
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials'});
        }

        const accessMaxAge = 15 * 60; // 15 minutes in seconds
        const refreshMaxAge = 7 * 24 * 60 * 60; // 7 days in seconds

        // Generate JWT tokens
        if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
            return res.status(500).json({ message: 'Internal server error: JWT secrets are not set' });
        }
        const accessToken = jwt.sign({ id: user.id, type: user.type }, process.env.JWT_ACCESS_SECRET, { expiresIn: accessMaxAge });
        const refreshToken = jwt.sign({ id: user.id, type: user.type }, process.env.JWT_REFRESH_SECRET, { expiresIn: refreshMaxAge });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // Use secure cookies in production
            sameSite: 'none', // Adjust as necessary
            path: "/auth/refresh", // Ensure the cookie is only sent to the refresh endpoint
            domain: "api.ehb-match.me",
            maxAge: refreshMaxAge * 1000, // Convert seconds to milliseconds
            partitioned: true // Use partitioned cookies for better privacy
        });

        const accessTokenExpiresAt = new Date(Date.now() + accessMaxAge * 1000).toISOString();
        const refreshTokenExpiresAt = new Date(Date.now() + refreshMaxAge * 1000).toISOString();

        if (res.locals.ua == 'EhBMatch/Mobile') return res.json({ message: 'Login successful', accessToken: accessToken, refreshToken: refreshToken, accessTokenExpiresAt: accessTokenExpiresAt, refreshTokenExpiresAt: refreshTokenExpiresAt, user: await getUserInfo(user.id) });
        return res.json({ message: 'Login successful', accessToken: accessToken, accessTokenExpiresAt: accessTokenExpiresAt, refreshTokenExpiresAt: refreshTokenExpiresAt, user: await getUserInfo(user.id) });
    })(req, res, next);
});

module.exports = router;
const express = require('express')
const passport = require('passport');
const jwt = require('jsonwebtoken');

require('./passportLocal.js');

const router = express.Router();

router.post('/', async (req, res, next) => {
    console.log("Login request received");
    await passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error: ' + err.message });
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials'});
        }

        const accessMaxAge = 30 * 1000;
        const refreshMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

        const accessToken = jwt.sign({ id: user.id, is_admin: user.is_admin }, process.env.JWT_ACCESS_SECRET, { expiresIn: accessMaxAge });
        const refreshToken = jwt.sign({ id: user.id, is_admin: user.is_admin }, process.env.JWT_REFRESH_SECRET, { expiresIn: refreshMaxAge });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // Use secure cookies in production
            sameSite: 'none', // Adjust as necessary
            path: "/auth/refresh", // Ensure the cookie is only sent to the refresh endpoint
            domain: "api.ehb-match.me",
            maxAge: refreshMaxAge,
        });

        const accessTokenExpiresAt = new Date(Date.now() + accessMaxAge).toISOString();
        const refreshTokenExpiresAt = new Date(Date.now() + refreshMaxAge).toISOString();

        if (res.locals.ua == 'EhBMatch/Mobile') return res.json({ message: 'Login successful', accessToken: accessToken, refreshToken: refreshToken, accessTokenExpiresAt: accessTokenExpiresAt, refreshTokenExpiresAt: refreshTokenExpiresAt });
        return res.json({ message: 'Login successful', accessToken: accessToken, accessTokenExpiresAt: accessTokenExpiresAt, refreshTokenExpiresAt: refreshTokenExpiresAt });
    })(req, res, next);
});

module.exports = router;
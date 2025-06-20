const express = require('express');

const router = express.Router();

router.post('/', (req, res) => {
    res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true, // Use secure cookies in production
            sameSite: 'none', // Adjust as necessary
            path: "/auth/refresh", // Ensure the cookie is only sent to the refresh endpoint
            domain: "api.ehb-match.me",
            partitioned: true // Use partitioned cookies for better privacy
        });
    res.json({ message: 'Logout successful' });
});

module.exports = router;
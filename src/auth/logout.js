const express = require('express');

const router = express.Router();

router.post('/', (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout successful' });
});

module.exports = router;
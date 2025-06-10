const express = require('express');
const { getUserInfo } = require('../sql/user.js');

require('./passportJWT.js');

const router = express.Router();

router.get('/', async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await getUserInfo(req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
});

module.exports = router;
const express = require('express');
const { getUserInfo } = require('../sql/users.js');
const passport = require('passport');

require('./passportJWT.js');

const router = express.Router();

router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    console.log('User ID:', req.user.id);
    console.log('User Info:', req.user);
    const user = await getUserInfo(req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
});

module.exports = router;
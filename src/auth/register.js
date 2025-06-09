const express = require('express');
const passport = require('passport');
const { register, registerAdmin } = require('../sql/register.js');
const authAdmin = require('./authAdmin.js');

const router = express.Router();

router.post('/user', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { email, wachtwoord } = req.body;
    try {
        const userId = await register(email, wachtwoord);
        res.status(201).json({ message: "User registered successfully", userId: userId });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'User registration failed' });
    }
});

router.post('/admin', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const { email, wachtwoord } = req.body;
    try {
        const adminId = await registerAdmin(email, wachtwoord);
        res.status(201).json({ message: "Admin registered successfully", adminId: adminId });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ error: 'Admin registration failed' });
    }
});

module.exports = router;
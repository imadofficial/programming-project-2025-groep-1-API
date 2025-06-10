const express = require('express');
const passport = require('passport');
const { register, registerAdmin } = require('../sql/register.js');
const authAdmin = require('./authAdmin.js');

const router = express.Router();

router.post('/user', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const email = req.body.email ? req.body.email.toLowerCase() : res.status(400).json({ error: 'Email is required' });
    const wachtwoord = req.body.wachtwoord ? req.body.wachtwoord.toLowerCase() : res.status(400).json({ error: 'Password is required' });
    const hashedPassword = await bcrypt.hash(wachtwoord, 11); // Hash the password before storing it
    try {
        const userId = await register(email, hashedPassword);
        res.status(201).json({ message: "User registered successfully", Id: userId });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'User registration failed' });
    }
});

router.post('/admin', [passport.authenticate('jwt', { session: false }), authAdmin], async (req, res) => {
    const { email, wachtwoord } = req.body;
    const hashedPassword = await bcrypt.hash(wachtwoord, 14); // Hash the password before storing it
    if (!bcrypt.compare(wachtwoord, hashedPassword)) {
        console.error('Password hashing failed');
        return res.status(400).json({ error: 'Password hashing failed' });
    }   
    try {
        const adminId = await registerAdmin(email, hashedPassword);
        res.status(201).json({ message: "Admin registered successfully", Id: adminId });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ error: 'Admin registration failed' });
    }
});

module.exports = router;
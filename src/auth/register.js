const express = require('express');
const passport = require('passport');
const { register, registerAdmin, registerStudent, registerBedrijf } = require('../sql/register.js');
const authAdmin = require('./authAdmin.js');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/user', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    const email = req.body.email.toLowerCase();

    const wachtwoord = req.body.wachtwoord;

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
    if (!req.body.email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    const email = req.body.email.toLowerCase();

    const wachtwoord = req.body.wachtwoord;

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

router.post('/student', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { email, wachtwoord, voornaam, achternaam, linkedin, profiel_foto, studiejaar, opleiding_id, date_of_birth } = req.body;
    const hashedPassword = await bcrypt.hash(wachtwoord, 11); // Hash the password before storing it
    try {
        const studentId = await registerStudent(email, hashedPassword, voornaam, achternaam, linkedin, profiel_foto, studiejaar, opleiding_id, date_of_birth);
        res.status(201).json({ message: "Student registered successfully", Id: studentId });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ error: 'Student registration failed' });
    }
});

router.post('/bedrijf', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { email, wachtwoord, naam, plaats, contact_email, linkedin, profiel_foto } = req.body;
    const hashedPassword = await bcrypt.hash(wachtwoord, 11); // Hash the password before storing it
    try {
        const bedrijfId = await registerBedrijf(email, hashedPassword, naam, plaats, contact_email, linkedin, profiel_foto);
        res.status(201).json({ message: "Company registered successfully", Id: bedrijfId });
    } catch (error) {
        console.error('Error registering company:', error);
        res.status(500).json({ error: 'Company registration failed' });
    }
});

module.exports = router;
const express = require('express');
const passport = require('passport');
const { register, registerAdmin, registerStudent, registerBedrijf } = require('../sql/register.js');
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

router.post('/student', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { email, wachtwoord, voornaam, achternaam, linkedin, profielFoto, studiejaar, opleidingId, dob } = req.body;
    try {
        const studentId = await registerStudent(email, wachtwoord, voornaam, achternaam, linkedin, profielFoto, studiejaar, opleidingId, dob);
        res.status(201).json({ message: "Student registered successfully", studentId: studentId });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ error: 'Student registration failed' });
    }
});

router.post('/bedrijf', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { email, wachtwoord, naam, plaats, contact_email } = req.body;
    try {
        const bedrijfId = await registerBedrijf(email, wachtwoord, naam, plaats, contact_email);
        res.status(201).json({ message: "Company registered successfully", bedrijfId: bedrijfId });
    } catch (error) {
        console.error('Error registering company:', error);
        res.status(500).json({ error: 'Company registration failed' });
    }
});

module.exports = router;
const express = require('express');
const passport = require('passport');
const { register, registerAdmin, registerStudent, registerBedrijf } = require('../sql/register.js');
const authAdmin = require('./authAdmin.js');
const bcrypt = require('bcrypt');
const { deleteProfielFoto, addTempProfielFoto, cleanupTempProfielFoto } = require('../sql/profielFoto.js');
const { getAllEvents, addBedrijfToEvent } = require('../sql/event.js');

require('../auth/passportJWT.js');

// Common regex constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}\s-]+$/u;
const LINKEDIN_REGEX = /^(\/in\/[a-zA-Z0-9_-]+\/?|\/company\/[a-zA-Z0-9_-]+\/?$)/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const router = express.Router();

router.post('/user', async (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    const email = req.body.email.toLowerCase();

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const wachtwoord = req.body.password || req.body.wachtwoord; // Use wachtwoord if password is not provided

    if (!wachtwoord) {
        return res.status(400).json({ error: 'Password is required' });
    }

    // Validate password length
    if (wachtwoord.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    try {
        const hashedPassword = await bcrypt.hash(wachtwoord, 11); // Hash the password before storing it
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

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    const wachtwoord = req.body.password || req.body.wachtwoord; // Use wachtwoord if password is not provided

    if (!wachtwoord) {
        return res.status(400).json({ error: 'Password is required' });
    }

    // Validate password length
    if (wachtwoord.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    try {
        const hashedPassword = await bcrypt.hash(wachtwoord, 14); // Hash the password before storing it
        const adminId = await registerAdmin(email, hashedPassword);
        res.status(201).json({ message: "Admin registered successfully", Id: adminId });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ error: 'Admin registration failed' });
    }
});

router.post('/student', async (req, res) => {
    // The frontend should upload the file to /auth/profielfoto first and send the returned URL as 'profiel_foto'
    const { email, password: wachtwoord, voornaam, achternaam, linkedin, profiel_foto, studiejaar, opleiding_id, date_of_birth } = req.body;

    console.log('Registering student with data:', req.body);

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const emailLower = email.toLowerCase();
    // Validate email format
    if (!EMAIL_REGEX.test(emailLower)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!wachtwoord) {
        return res.status(400).json({ error: 'Password is required' });
    }

    if (wachtwoord.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    if (!voornaam || !achternaam || !studiejaar || !opleiding_id || !date_of_birth) {
        return res.status(400).json({ error: 'Voornaam, achternaam, studiejaar, opleiding_id, and date_of_birth are required' });
    }

    // Validate voornaam and achternaam format (only letters and spaces)
    if (!NAME_REGEX.test(voornaam) || !NAME_REGEX.test(achternaam)) {
        return res.status(400).json({ error: 'Voornaam and achternaam must contain only letters and spaces' });
    }

    // Validate linkedin URL format if provided (/in/[username] or /company/[companyname], not the full URL)
    const linkedinURL = linkedin ? linkedin.trim() : null; // Trim whitespace
    if (linkedinURL && !LINKEDIN_REGEX.test(linkedinURL)) {
        return res.status(400).json({ error: 'Invalid linkedin URL format' });
    }

    // Validate date_of_birth format (YYYY-MM-DD)
    if (!DATE_REGEX.test(date_of_birth)) {
        return res.status(400).json({ error: 'Invalid date_of_birth format. Use YYYY-MM-DD.' });
    }

    // Validate date_of_birth is not in the future and user is at least 16 years old
    const minAge = 16; // Minimum age requirement
    const today = new Date();
    // Strict date validation to prevent invalid dates like '2023-02-30'
    const [year, month, day] = date_of_birth.split('-').map(Number);
    const dob = new Date(date_of_birth);
    if (
        dob.getFullYear() !== year ||
        dob.getMonth() + 1 !== month ||
        dob.getDate() !== day
    ) {
        return res.status(400).json({ error: 'Invalid date_of_birth: not a real date.' });
    }
    if (dob >= today) {
        return res.status(400).json({ error: 'date_of_birth must be in the past' });
    }
    const monthDiff = today.getMonth() - dob.getMonth();
    let age = today.getFullYear() - dob.getFullYear();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    if (age < minAge) {
        return res.status(400).json({ error: `User must be at least ${minAge} years old` });
    }

    // Validate opleiding_id as a number
    const opleidingId = parseInt(opleiding_id, 10);
    if (isNaN(opleidingId)) {
        return res.status(400).json({ error: 'Invalid opleiding_id format. It must be a number.' });
    }

    // Validate studiejaar as a number between 1 and 4
    const studiejaarParsed = parseInt(studiejaar, 10);
    if (studiejaarParsed < 1 || studiejaarParsed > 4) {
        return res.status(400).json({ error: 'Studiejaar must be between 1 and 4' });
    }

    // Validate profiel_foto key if provided (no URL check needed)
    try {
        const hashedPassword = await bcrypt.hash(wachtwoord, 11); // Hash the password before storing it
        const studentId = await registerStudent(emailLower, hashedPassword, voornaam, achternaam, linkedinURL, profiel_foto, studiejaarParsed, opleidingId, date_of_birth);
        // Clean up temp profiel foto if provided
        if (profiel_foto) {
            try {
                await cleanupTempProfielFoto(profiel_foto); // This will clean up temp_uploaded_profiel_fotos for the new student
            } catch (cleanupError) {
                console.error('Error cleaning up temp profiel foto after student registration:', cleanupError);
            }
        }
        res.status(201).json({ message: "Student registered successfully", Id: studentId });
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).json({ error: 'Student registration failed' });
    }
});

router.post('/bedrijf', async (req, res) => {
    // The frontend should upload the file to /auth/profielfoto first and send the returned URL as 'profiel_foto'
    const { email, password: wachtwoord, naam, plaats, contact_email, linkedin, profiel_foto, evenement, sector_id } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const emailLower = email.toLowerCase();
    // Validate email format
    if (!EMAIL_REGEX.test(emailLower)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!naam || !plaats || !contact_email) {
        return res.status(400).json({ error: 'Naam, plaats, and contact_email are required' });
    }

    // Validate naam and plaats format (only letters and spaces)
    if (!NAME_REGEX.test(naam)) {
        return res.status(400).json({ error: 'Naam must only contain letters and spaces' });
    }
    if (!NAME_REGEX.test(plaats)) {
        return res.status(400).json({ error: 'Plaats must only contain letters and spaces' });
    }

    // Validate contact_email format
    const contactEmail = contact_email.toLowerCase();
    if (!EMAIL_REGEX.test(contactEmail)) {
        return res.status(400).json({ error: 'Invalid contact_email format' });
    }

    // Validate linkedin URL format if provided (/in/[username] or /company/[companyname], not the full URL)
    const linkedinURL = linkedin ? linkedin.trim() : null; // Trim whitespace
    if (linkedinURL && !LINKEDIN_REGEX.test(linkedinURL)) {
        return res.status(400).json({ error: 'Invalid linkedin URL format' });
    }

    if (!wachtwoord) {
        return res.status(400).json({ error: 'Password is required' });
    }

    if (wachtwoord.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    try {
        const hashedPassword = await bcrypt.hash(wachtwoord, 11); // Hash the password before storing it
        const bedrijfId = await registerBedrijf(emailLower, hashedPassword, naam, plaats, contactEmail, linkedinURL, profiel_foto, sector_id);
        // Clean up temp profiel foto if provided
        if (profiel_foto) {
            try {
                await cleanupTempProfielFoto(profiel_foto); // This will clean up temp_uploaded_profiel_fotos for the new bedrijf
            } catch (cleanupError) {
                console.error('Error cleaning up temp profiel foto after bedrijf registration:', cleanupError);
            }
        }
        try {
            const evenementResp = await addBedrijfToEvent(bedrijfId, evenement ? evenement : 1); // Default to event 1 if not provided
            console.log('Bedrijf added to event:', evenementResp);
        } catch (error) {
            console.error('Event not found:', error);
        }
        res.status(201).json({ message: "Company registered successfully", Id: bedrijfId });
    } catch (error) {
        console.error('Error registering company:', error);
        res.status(500).json({ error: 'Company registration failed' });
    }
});

module.exports = router;
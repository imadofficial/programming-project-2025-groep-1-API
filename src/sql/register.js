const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

async function register(email, wachtwoord) {
    const pool = getPool('ehbmatchdev');
    const query = 'INSERT INTO gebruiker (email, wachtwoord) VALUES (?,?)';

    try {
        const [result] = await pool.query(query, [email, wachtwoord]);
        return result.insertId; // Return the ID of the newly inserted user
    } catch (error) {
        console.error('Database query error in register:', error.message, error.stack);
        throw new Error('Registration failed');
    }
}

async function registerAdmin(email, wachtwoord) {
    const pool = getPool('ehbmatchdev');
    const pool = getPool('ehbmatchdev');
    const query = 'INSERT INTO gebruiker (email, wachtwoord, is_admin) VALUES (?,?,1)';

    try {
        const [result] = await pool.query(query, [email, wachtwoord]);
        return result.insertId; // Return the ID of the newly inserted user
    } catch (error) {
        console.error('Database query error in registerAdmin:', error.message, error.stack);
        throw new Error('Admin registration failed');
    }
}

async function registerStudent(email, wachtwoord, voornaam, achternaam, linkedin, profielFoto, studiejaar, opleidingId, dob) {
    const pool = getPool('ehbmatchdev');
    const query1 = 'INSERT INTO gebruiker (email, wachtwoord, is_admin) VALUES (?,?,0)';
    const query2 = 'INSERT INTO student (gebruiker_id, voornaam, achternaam, linkedin, profiel_foto, studiejaar, opleiding_id, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    try {
        const [result] = await pool.query(query1, [email, wachtwoord]);
        const gebruikerId = result.insertId;
        const [result2] = await pool.query(query2, [gebruikerId, voornaam, achternaam, linkedin, profielFoto, studiejaar, opleidingId, dob]);
        return result2.insertId; // Return the ID of the newly inserted user
    } catch (error) {
        console.error('Database query error in registerStudent:', error.message, error.stack);
        throw new Error('Student registration failed');
    }
}

async function registerBedrijf(email, wachtwoord, naam, plaats, contact_email) {
    const pool = getPool('ehbmatchdev');
    const query1 = 'INSERT INTO gebruiker (email, wachtwoord, is_admin) VALUES (?,?,0)';
    const query2 = 'INSERT INTO bedrijf (gebruiker_id,naam, plaats, contact_email) VALUES (?, ?, ?, ?, ?)';

    try {
        const [result] = await pool.query(query1, [email, wachtwoord]);
        const gebruikerId = result.insertId;
        const [result2] = await pool.query(query2, [gebruikerId, naam, plaats, contact_email]);
        return result2.insertId; // Return the ID of the newly inserted user
    } catch (error) {
        console.error('Database query error in registerStudent:', error.message, error.stack);
        throw new Error('Student registration failed');
    }
}


module.exports = {
    register,
    registerAdmin,
    registerStudent,
    registerBedrijf
};
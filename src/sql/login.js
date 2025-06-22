const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');

const bcrypt = require('bcrypt');


dotenv.config();

const DB_NAME = process.env.DB_NAME || 'ehbmatchdev';

async function getWachtwoord(emailadres) {
    const pool = getPool(DB_NAME);
    const [rows] = await pool.query('SELECT wachtwoord FROM gebruiker WHERE email = ?', [emailadres]);
    return rows[0];
}


async function getUserType(id) {
    const pool = getPool(DB_NAME);
    const query = 'SELECT type FROM gebruiker WHERE id = ?'; // Corrected table name

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0].type; // Return the type of the user
        } else {
            return null; // Return null if no user is found
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}


async function isAdmin(id) {
    const pool = getPool(DB_NAME);
    const query = 'SELECT type FROM gebruiker WHERE id = ?'; // Corrected table name

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0].type === 1; // Check if user is admin
        } else {
            return false;
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

async function login(email, wachtwoord) {
    const pool = getPool(DB_NAME); // Updated database name
    const query = 'SELECT g.id, g.wachtwoord FROM gebruiker g WHERE email = ? AND NOT EXISTS (SELECT 1 FROM bedrijf WHERE gebruiker_id = g.id AND goedkeuring = 0)'; // Corrected table name


    try {
        const [rows] = await pool.query(query, [email]);
        console.log('Query result:', rows); // Log the query result
        if (rows.length === 0) {
            console.log('No user found with email, or user is not approved:', email); // Log if no user is found
            return null;
        }

        const match = await bcrypt.compare(wachtwoord, rows[0].wachtwoord);
        console.log('Password match:', match); // Log the password match result

        if (rows.length > 0 && match) {
            console.log('Login successful for email:', email); // Log successful login
            return rows[0].id;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Database query error:', error); // Log the error
        throw new Error('Database query failed');
    }
}

module.exports = {
    getUserType,
    login,
    isAdmin,
    getWachtwoord
};
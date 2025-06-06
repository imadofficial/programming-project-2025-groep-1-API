const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');

async function getUserById(id) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM gebruiker WHERE id = ?'; // Corrected table name

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0]; // Return the first user found
        } else {
            return null; // Return null if no user is found
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}
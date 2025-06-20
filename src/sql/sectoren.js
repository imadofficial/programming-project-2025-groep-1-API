const mysql = require('mysql2');
const { getPool } = require('../globalEntries.js');
require('dotenv').config();
const DB_NAME = process.env.DB_NAME || 'ehbmatchdev';


async function getAllSectoren() {
    const pool = getPool(DB_NAME);
    const query = 'SELECT * FROM sector';

    try {
        const [rows] = await pool.query(query);
        console.log('Query result:', rows); // Log the query result

        if (rows.length > 0) {
            return rows; // Return all rows instead of just the first one
        } else {
            return []; // Return an empty array if no rows are found
        }
    } catch (error) {
        console.error('Database query error:', error); // Log the error
        throw new Error('Database query failed');
    }
}

async function getSectorById(id) {
    const pool = getPool(DB_NAME);
    const query = 'SELECT * FROM sector WHERE id = ?';

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0]; // Return the first sector found
        } else {
            return null; // Return null if no sector is found
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

async function addSector(naam) {
    const pool = getPool(DB_NAME);
    const query = 'INSERT IGNORE INTO sector (naam) VALUES (?)';

    try {
        naam = naam.trim(); // Trim whitespace from the sector name
        naam = naam.replace(/\s+/g, ' '); // Replace multiple spaces with a single space
        naam = naam.toLowerCase(); // Convert to lowercase
        const [result] = await pool.query(query, [naam]);
        if (result.insertId && result.insertId !== 0) {
            return { id: result.insertId, naam: naam }; // Return the new sector with its ID
        } else {
            const [existingSector] = await pool.query('SELECT * FROM sector WHERE naam = ?', [naam]);
            if (existingSector.length > 0) {
                return existingSector[0]; // Return the existing sector if it was not inserted
            }
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

async function deleteSector(id) {
    const pool = getPool(DB_NAME);
    if (!id) {
        throw new Error('Sector ID is required for deletion');
    }
    const query = 'DELETE FROM sector WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0; // Return true if a sector was deleted
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

module.exports = {
    getAllSectoren,
    getSectorById,
    addSector,
    deleteSector
};
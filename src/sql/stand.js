const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

const DB_NAME = process.env.DB_NAME || 'ehbmatchdev';

async function getAllStand(){
    const pool = getPool(DB_NAME);
    const query = 'SELECT * FROM stand';

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

async function addStand(lokaal, id_bedrijf) {
    const pool = getPool(DB_NAME);
    const query = 'INSERT IGNORE INTO stand (lokaal, id_bedrijf) VALUES (?, ?)';

    try {
        const [result] = await pool.query(query, [lokaal, id_bedrijf]);
        if (result.insertId && result.insertId !== 0) {
            return result.insertId; // Return the ID of the newly inserted record
        } else {
            const [rows] = await pool.query('SELECT id FROM stand WHERE lokaal = ? AND id_bedrijf = ?', [lokaal, id_bedrijf]);
            return rows[0].id; // Return the existing record ID if it was not newly inserted
        }
    } catch (error) {
        console.error('Database query error in addStand:', error.message, error.stack);
        throw new Error('Adding stand failed');
    }
}   

async function removeStand(id_stand) {
    const pool = getPool(DB_NAME);
    const query = 'DELETE FROM stand WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id_stand]);
        return result.affectedRows > 0; // Return true if a row was deleted
    } catch (error) {
        console.error('Database query error in removeStand:', error.message, error.stack);
        throw new Error('Removing stand failed');
    }
}

async function getStandById(id) {
    const pool = getPool(DB_NAME);
    const query = 'SELECT * FROM stand WHERE id = ?';

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0]; // Return the first row if found
        } else {
            return null; // Return null if no row is found
        }
    } catch (error) {
        console.error('Database query error in getStandById:', error.message, error.stack);
        throw new Error('Getting stand by ID failed');
    }
}


module.exports = {
    getAllStand,
    addStand,
    removeStand,
    getStandById
};
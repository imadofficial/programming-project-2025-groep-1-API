const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

async function getAllStand(){
    const pool = getPool('ehbmatchdev');
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
    const pool = getPool('ehbmatchdev');
    const query = 'INSERT INTO stand (lokaal, id_bedrijf) VALUES (?, ?)';

    try {
        const [result] = await pool.query(query, [lokaal, id_bedrijf]);
        return result.insertId; // Return the ID of the newly inserted record
    } catch (error) {
        console.error('Database query error in addStand:', error.message, error.stack);
        throw new Error('Adding stand failed');
    }
}   

async function removeStand(id_stand) {
    const pool = getPool('ehbmatchdev');
    const query = 'DELETE FROM stand WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id_stand]);
        return result.affectedRows > 0; // Return true if a row was deleted
    } catch (error) {
        console.error('Database query error in removeStand:', error.message, error.stack);
        throw new Error('Removing stand failed');
    }
}

module.exports = {
    getAllStand,
    addStand,
    removeStand

};
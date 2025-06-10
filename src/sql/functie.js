const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

async function getAllFuncties() {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM functie';

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

async function addFunctie(naam) {
    const pool = getPool('ehbmatchdev');
    const query = 'INSERT INTO functie (naam) VALUES (?)';

    try {
        const [result] = await pool.query(query, [naam]);
        return result.insertId; // Return the ID of the newly inserted record
    } catch (error) {
        console.error('Database query error in addFunctie:', error.message, error.stack);
        throw new Error('Adding functie failed');
    }
}


async function removeFunctie(id_functie) {
    const pool = getPool('ehbmatchdev');
    const query = 'DELETE FROM functie WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id_functie]);
        return result.affectedRows > 0; // Return true if a row was deleted
    } catch (error) {
        console.error('Database query error in removeFunctie:', error.message, error.stack);
        throw new Error('Removing functie failed');
    }
}


module.exports = {
    getAllFuncties,
    addFunctie,
    removeFunctie
};
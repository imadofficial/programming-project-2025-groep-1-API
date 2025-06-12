const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

async function getAllStudenten() {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM student'; // Corrected table name

    try {
        const [rows] = await pool.query(query);
        console.log('Query result:', rows); // Log the query result 
        if (rows.length > 0) {
            return rows; // Return all rows instead of just the first one
        } else {
            return []; // Return an empty array if no rows are found
        }   
    }
    catch (error) {
        console.error('Database query error:', error); // Log the error
        throw new Error('Database query failed');
    }
}
async function getStudentById(id) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM student WHERE id = ?';

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0]; // Return the first student found
        } else {
            return null; // Return null if no student is found
        }   
    }
    catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

async function updateStudent(id, data) {
    const pool = getPool('ehbmatchdev');
    const query = 'UPDATE student SET ? WHERE id = ?';

    if (!id || !data) {
        throw new Error('ID and data are required for update');
    }

    // No need to check for invalid keys here; handled in the route

    try {
        const [result] = await pool.query(query, [data, id]);
        
        if (result.affectedRows === 0) {
            throw new Error('No rows updated, check if the ID exists');
        }
        return result.affectedRows > 0; // Return true if the update was successful
    } catch (error) {
        console.error('Database update error:', error);
        throw new Error('Database update failed');
    }
}


module.exports = {
    getAllStudenten,
    getStudentById,
    updateStudent
};
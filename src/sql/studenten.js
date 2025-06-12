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
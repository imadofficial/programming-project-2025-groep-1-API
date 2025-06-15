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
    const query = 'SELECT s.*, g.email AS contact_email FROM student s JOIN gebruiker g ON s.gebruiker_id = g.id WHERE s.gebruiker_id = ?';
    const baseUrl = "https://gt0kk4fbet.ufs.sh/f/";

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            const student = rows[0];
            if (student.profiel_foto) {
                student.profiel_foto_key = student.profiel_foto;
                student.profiel_foto_url = baseUrl + student.profiel_foto;
            } else {
                student.profiel_foto_key = null;
                student.profiel_foto_url = null;
            }
            delete student.profiel_foto; // Remove the original profiel_foto field
            return student; // Return the first student found with extra fields
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
    const query = 'UPDATE student SET ? WHERE gebruiker_id = ?';

    if (!id || !data) {
        throw new Error('ID and data are required for update');
    }

    // No need to check for invalid keys here; handled in the route

    try {
        const [result] = await pool.query(query, [data, id]);

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

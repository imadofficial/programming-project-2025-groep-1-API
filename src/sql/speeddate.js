const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

async function getSpeeddateById(id) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM speeddate WHERE id = ?';

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0]; // Return the first speeddate found
        } else {
            return null; // Return null if no speeddate is found
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

async function getAllSpeeddates() {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM speeddate';

    try {
        const [rows] = await pool.query(query);
        console.log('Query result:', rows); // Log the query result
        if (rows.length > 0) {
            return rows; // Return all speeddates
        } else {
            return []; // Return an empty array if no speeddates are found
        }
    } catch (error) {
        console.error('Database query error:', error); // Log the error
        throw new Error('Database query failed');
    }
}

async function getDatum(id) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT datum FROM speeddate WHERE id = ?';

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0].datum; // Return the date of the speeddate
        } else {
            return null; // Return null if no date is found
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

async function speeddateAkkoord(id){
    const pool = getPool('ehbmatchdev');
    const query = 'UPDATE speeddate SET akkoord = 1 WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0; // Return true if a row was updated
    } catch (error) {
        console.error('Database query error in speeddateAkkoord:', error.message, error.stack);
        throw new Error('Speeddate agreement update failed');
    }
}

async function speeddateAfgekeurd(id){
    const pool = getPool('ehbmatchdev');
    const query = 'DELETE FROM speeddate WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0; // Return true if a row was updated
    } catch (error) {
        console.error('Database query error in speeddateAfgekeurd:', error.message, error.stack);
        throw new Error('Speeddate rejection update failed');
    }
}

async function addSpeeddate(id_bedrijf, id_student, datum) {
    const pool = getPool('ehbmatchdev');
    const query = 'INSERT INTO speeddate (id_bedrijf, id_student, datum) VALUES (?,?, ?)';

    try {
        const [result] = await pool.query(query, [id_bedrijf, id_student, datum]);
        console.log('Speeddate added with ID:', result.insertId); // Log the ID of the newly inserted speeddate
        return result.insertId; // Return the ID of the newly inserted speeddate
    } catch (error) {
        console.error('Database query error in addSpeeddate:', error.message, error.stack);
        throw new Error('Adding speeddate failed');
    }
}

async function getInfo(id) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM speeddate WHERE id = ?';

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0]; // Return the first row if found
        } else {
            return null; // Return null if no row is found
        }
    } catch (error) {
        console.error('Database query error in getInfo:', error.message, error.stack);
        throw new Error('Getting speeddate info failed');
    }
}

module.exports = {
    getSpeeddateById,
    getAllSpeeddates,
    getDatum,
    speeddateAkkoord,
    speeddateAfgekeurd,
    addSpeeddate,
    getInfo
};
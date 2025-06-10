const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

async function getAllOpleidingen() {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM opleiding'; // Corrected table name

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

async function addOpleidingBijBedrijf(opleidingId, bedrijfId) {
    const pool = getPool('ehbmatchdev');

    const query = 'INSERT INTO bedrijf_opleiding (bedrijf_id, opleiding_id) VALUES (?, ?)';

    try {
        const [result] = await pool.query(query, [bedrijfId, opleidingId]);
        return result.insertId; // Return the ID of the newly inserted record
    } catch (error) {
        console.error('Database query error in addOpleidingBijBedrijf:', error.message, error.stack);
        throw new Error('Adding opleiding to bedrijf failed');
    }
}

async function removeOpleidingBijBedrijf(opleidingId, bedrijfId) {
    const pool = getPool('ehbmatchdev');

    const query = 'DELETE FROM bedrijf_opleiding WHERE bedrijf_id = ? AND opleiding_id = ?';

    try {
        const [result] = await pool.query(query, [bedrijfId, opleidingId]);
        return result.affectedRows > 0; // Return true if a row was deleted
    } catch (error) {
        console.error('Database query error in removeOpleidingBijBedrijf:', error.message, error.stack);
        throw new Error('Removing opleiding from bedrijf failed');
    }
}

async function addOpleiding(naam, type) {
    const pool = getPool('ehbmatchdev');
    const query = 'INSERT INTO opleiding (naam, type) VALUES (?, ?)';

    try {
        const [result] = await pool.query(query, [naam, type]);
        return result.insertId; // Return the ID of the newly inserted opleiding
    } catch (error) {
        console.error('Database query error in addOpleiding:', error.message, error.stack);
        throw new Error('Adding opleiding failed');
    }
}

async function deleteOpleiding(id) {
    const pool = getPool('ehbmatchdev');
    const query = 'DELETE FROM opleiding WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0; // Return true if a row was deleted
    } catch (error) {
        console.error('Database query error in deleteOpleiding:', error.message, error.stack);
        throw new Error('Deleting opleiding failed');
    }   
}

async function modifyOpleiding(id, naam, type) {
    const pool = getPool('ehbmatchdev');
    const query = 'UPDATE opleiding SET naam = ?, type = ? WHERE id = ?';

    try {
        const [result] = await pool.query(query, [naam, type, id]);
        return result.affectedRows > 0; // Return true if a row was updated
    } catch (error) {
        console.error('Database query error in modifyOpleiding:', error.message, error.stack);
        throw new Error('Modifying opleiding failed');
    }

}



module.exports = {
    getAllOpleidingen,
    addOpleidingBijBedrijf,
    removeOpleidingBijBedrijf,
    addOpleiding,
    deleteOpleiding,
    modifyOpleiding
};
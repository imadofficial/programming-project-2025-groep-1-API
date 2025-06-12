const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

async function getAllBedrijven() {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM bedrijf'; // Corrected table name

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
async function getBedrijfById(id) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM bedrijf WHERE id = ?';

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0]; // Return the first bedrijf found
        } else {
            return null; // Return null if no bedrijf is found
        }   
    }
    catch (error) {
        console.error('Database query error:', error);
        throw new Error('Database query failed');
    }
}

async function getGoedgekeurdeBedrijven() {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM bedrijf WHERE goedgekeurd = 1';

    try {
        const [rows] = await pool.query(query);
        if (rows.length > 0) {
            return rows; // Return all goedgekeurde bedrijven
        } else {
            return []; // Return an empty array if no goedgekeurde bedrijven are found
        }
    }
    catch (error) {
        console.error('Database query error:', error); // Log the error
        throw new Error('Database query failed');
    }
}

async function getNietGoedgekeurdeBedrijven() {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM bedrijf WHERE goedgekeurd = 0';

    try {
        const [rows] = await pool.query(query);
        if (rows.length > 0) {
            return rows; // Return all niet goedgekeurde bedrijven
        } else {
            return []; // Return an empty array if no niet goedgekeurde bedrijven are found
        }
    }
    catch (error) {
        console.error('Database query error:', error); // Log the error
        throw new Error('Database query failed');
    }
}

async function keurBedrijfGoed(id){
    const pool = getPool('ehbmatchdev');
    const query = 'UPDATE bedrijf SET goedgekeurd = 1 WHERE gebruiker_id = ?';

    try {
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0; // Return true if a row was updated
    } catch (error) {
        console.error('Database query error in keurBedrijfGoed:', error.message, error.stack);
        throw new Error('Keuren van bedrijf is mislukt');
    }
}

async function updateBedrijf(id, data) {
    const pool = getPool('ehbmatchdev');
    const query = 'UPDATE bedrijf SET ? WHERE id = ?';

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
    getAllBedrijven,
    getBedrijfById,
    getGoedgekeurdeBedrijven,
    getNietGoedgekeurdeBedrijven,
    keurBedrijfGoed,
    updateBedrijf
};
const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

const DB_NAME = process.env.DB_NAME || 'ehbmatchdev';

async function getAllFinalWorks() {
    const pool = getPool(DB_NAME);
    const query = 'SELECT * FROM finalwork';

    try {
        const [rows] = await
        pool.query(query);
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

async function addFinalWork(id_student, lokaal) {
    const pool = getPool(DB_NAME);
    const query = 'INSERT INTO finalwork (id_student, lokaal) VALUES (?, ?)';

    try {
        const [result] = await pool.query(query, [id_student, lokaal]);
        return result.insertId; // Return the ID of the newly inserted record
    } catch (error) {
        console.error('Database query error in addFinalWork:', error.message, error.stack);
        throw new Error('Adding final work failed');
    }
}

async function removeFinalWork(id_finalwork) {
    const pool = getPool(DB_NAME);
    const query = 'DELETE FROM finalwork WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id_finalwork]);
        return result.affectedRows > 0; // Return true if a row was deleted
    } catch (error) {
        console.error('Database query error in removeFinalWork:', error.message, error.stack);
        throw new Error('Removing final work failed');
    }
}

async function getFinalworkById(id) {
    const pool = getPool(DB_NAME);
    const query = 'SELECT * FROM finalwork WHERE id = ?';

    try {
        const [rows] = await pool.query(query, [id]);
        if (rows.length > 0) {
            return rows[0]; // Return the first row if found
        } else {
            return null; // Return null if no row is found
        }
    } catch (error) {
        console.error('Database query error in getFinalworkById:', error.message, error.stack);
        throw new Error('Getting final work by ID failed');
    }
}

async function modifyFinalWork(id_finalwork, id_student, lokaal) {
    const pool = getPool(DB_NAME);
    const query = 'UPDATE finalwork SET id_student = ?, lokaal = ? WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id_student, lokaal, id_finalwork]);
        return result.affectedRows > 0; // Return true if a row was updated
    } catch (error) {
        console.error('Database query error in modifyFinalWork:', error.message, error.stack);
        throw new Error('Modifying final work failed');
    }
}


module.exports = {
    getAllFinalWorks,
    addFinalWork,
    removeFinalWork,
    getFinalworkById,
    modifyFinalWork
};
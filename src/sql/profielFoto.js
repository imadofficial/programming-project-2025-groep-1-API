const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');

const { UTApi } = require('uploadthing/server');
const utapi = new UTApi();

dotenv.config();

async function addTempProfielFoto(fotoKey) {
    const pool = getPool('ehbmatchdev');
    const query = 'INSERT INTO temp_uploaded_profiel_fotos (file_key) VALUES (?)';
    try {
        const [result] = await pool.query(query, [fotoKey]);
        return result.affectedRows > 0; // Return true if the insert was successful
    } catch (error) {
        console.error('Database query error in addTempProfielFoto:', error.message, error.stack);
        throw new Error('Saving profiel foto failed');
    }
}

async function cleanupTempProfielFoto(fotoKey) {
    const pool = getPool('ehbmatchdev');
    const query = 'DELETE FROM temp_uploaded_profiel_fotos WHERE file_key = ?';
    try {
        const deletedResponse = await utapi.deleteFiles([fotoKey]); // Delete the file from Uploadthing
        if (!deletedResponse.success) {
            console.error('Error deleting file from Uploadthing:', deletedResponse.error);
        }
        const [result] = await pool.query(query, [fotoKey]);
        return result.affectedRows > 0; // Return true if the delete was successful
    } catch (error) {
        console.error('Database query error in cleanupTempProfielFoto:', error.message, error.stack);
        throw new Error('Cleaning up temp profiel foto failed');
    }
}

async function isLinkedToUser(fotoKey) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT 1 FROM student WHERE profiel_foto = ? UNION SELECT 1 FROM bedrijf WHERE profiel_foto = ?';
    try {
        const [result] = await pool.query(query, [fotoKey, fotoKey]);
        return result.length > 0; // Return true if the fotoKey is linked to any user
    } catch (error) {
        console.error('Database query error in isLinkedToUser:', error.message, error.stack);
        throw new Error('Checking if profiel foto is linked to user failed');
    }
}

async function getLinkedUser(fotoKey) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT gebruiker_id FROM student WHERE profiel_foto = ? UNION SELECT gebruiker_id FROM bedrijf WHERE profiel_foto = ?';
    try {
        const [result] = await pool.query(query, [fotoKey, fotoKey]);
        if (result.length > 0) {
            return result[0].gebruiker_id; // Return the first linked user ID
        }
        return null; // Return null if no user is linked
    } catch (error) {
        console.error('Database query error in getLinkedUser:', error.message, error.stack);
        throw new Error('Getting linked user for profiel foto failed');
    }
}

async function updateProfielFoto(gebruikerId, fotoKey) {
    const pool = getPool('ehbmatchdev');

    const queryStudent = 'UPDATE student SET profiel_foto = ? WHERE gebruiker_id = ?';
    const queryBedrijf = 'UPDATE bedrijf SET profiel_foto = ? WHERE gebruiker_id = ?';
    try {
        const [resultStudent] = await pool.query(queryStudent, [fotoKey, gebruikerId]);
        const [resultBedrijf] = await pool.query(queryBedrijf, [fotoKey, gebruikerId]);

        return resultStudent.affectedRows > 0 || resultBedrijf.affectedRows > 0; // Return true if either update was successful
    } catch (error) {
        console.error('Database query error in updateProfielFoto:', error.message, error.stack);
        throw new Error('Changing profiel foto failed');
    }
}

async function deleteProfielFoto(gebruikerId) {
    const pool = getPool('ehbmatchdev');

    const getProfielFotoQuery = 'SELECT profiel_foto FROM student WHERE gebruiker_id = ? UNION SELECT profiel_foto FROM bedrijf WHERE gebruiker_id = ?';
    const [resultKey] = await pool.query(getProfielFotoQuery, [gebruikerId, gebruikerId]);
    if (resultKey.length > 0 && resultKey[0].profiel_foto) {
        const fotoKey = resultKey[0].profiel_foto;
        try {
            await utapi.deleteFiles([fotoKey]); // Delete the file from Uploadthing
        } catch (error) {
            console.error('Error deleting file from Uploadthing:', error);
            throw new Error('Failed to delete profiel foto from storage');
        }
        try {
            await pool.query('DELETE FROM temp_uploaded_profiel_fotos WHERE file_key = ?', [fotoKey]); // Clean up temp uploaded profiel fotos
        } catch (error) {
            console.error('Database cleanup error (deleteProfielFoto):', error);
            throw new Error('Failed to clean up temp profiel foto');
        }
    }


    const queryStudent = 'UPDATE student SET profiel_foto = NULL WHERE gebruiker_id = ?';
    const queryBedrijf = 'UPDATE bedrijf SET profiel_foto = NULL WHERE gebruiker_id = ?';
    try {
        const [resultStudent] = await pool.query(queryStudent, [gebruikerId]);
        const [resultBedrijf] = await pool.query(queryBedrijf, [gebruikerId]);
        return resultStudent.affectedRows > 0 || resultBedrijf.affectedRows > 0;
    } catch (error) {
        console.error('Database update error (deleteProfielFoto):', error);
        throw new Error('Failed to delete profiel foto');
    }
}

module.exports = {
    addTempProfielFoto,
    cleanupTempProfielFoto,
    updateProfielFoto,
    deleteProfielFoto,
    isLinkedToUser,
    getLinkedUser
};
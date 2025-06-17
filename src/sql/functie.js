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

async function modifyFunctie(id_functie, naam) {
    const pool = getPool('ehbmatchdev');
    const query = 'UPDATE functie SET naam = ? WHERE id = ?';

    try {
        const [result] = await pool.query(query, [naam, id_functie]);
        return result.affectedRows > 0; // Return true if a row was updated
    } catch (error) {
        console.error('Database query error in modifyFunctie:', error.message, error.stack);
        throw new Error('Modifying functie failed');
    }
}

async function getFunctieById(id_functie) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM functie WHERE id = ?';

    try {
        const [rows] = await pool.query(query, [id_functie]);
        if (rows.length > 0) {
            return rows[0]; // Return the first row if found
        } else {
            return null; // Return null if no row is found
        }
    } catch (error) {
        console.error('Database query error in getFunctieById:', error.message, error.stack);
        throw new Error('Getting functie by ID failed');
    }
}

async function getFunctiesByUserId(id_gebruiker) {
    const pool = getPool('ehbmatchdev');
    const query = `
        SELECT f.*
        FROM functie f
        JOIN gebruiker_functie gf ON gf.id_functie = f.id
        WHERE gf.id_gebruiker = ?
    `;

    try {
        const [rows] = await pool.query(query, [id_gebruiker]);
        if (rows.length > 0) {
            return rows; // Return all functies for the user
        } else {
            return []; // Return an empty array if no functies are found
        }
    } catch (error) {
        console.error('Database query error in getFunctieByUserId:', error.message, error.stack);
        throw new Error('Getting functie by user ID failed');
    }
}

async function addFunctieToUser(id_gebruiker, id_functie) {
    const pool = getPool('ehbmatchdev');
    const query = 'INSERT INTO gebruiker_functie (id_gebruiker, id_functie) VALUES (?, ?)';

    try {
        const [result] = await pool.query(query, [id_gebruiker, id_functie]);
        return result.affectedRows > 0; // Return true if the record was inserted
    } catch (error) {
        console.error('Database query error in addFunctieToUser:', error.message, error.stack);
        throw new Error('Adding functie to user failed');
    }
}

async function addFunctiesToUser(id_gebruiker, functies) {
    const pool = getPool('ehbmatchdev');
    if (!Array.isArray(functies) || functies.length === 0) {
        return 0;
    }
    // Build bulk insert values
    const values = functies.map(functieId => [id_gebruiker, functieId]);
    // Dynamically build the query for bulk insert
    const placeholders = values.map(() => '(?, ?)').join(', ');
    const flatValues = values.flat();
    const query = `INSERT INTO gebruiker_functie (id_gebruiker, id_functie) VALUES ${placeholders}`;
    try {
        const [result] = await pool.query(query, flatValues);
        return result.affectedRows > 0; // Return true if any rows were inserted
    } catch (error) {
        console.error('Database query error in addFunctiesToUser:', error.message, error.stack);
        throw new Error('Adding multiple functies to user failed');
    }
}

async function removeFunctieFromUser(id_gebruiker, id_functie) {
    const pool = getPool('ehbmatchdev');
    const query = 'DELETE FROM gebruiker_functie WHERE id_gebruiker = ? AND id_functie = ?';

    try {
        const [result] = await pool.query(query, [id_gebruiker, id_functie]);
        return result.affectedRows > 0; // Return true if a row was deleted
    } catch (error) {
        console.error('Database query error in removeFunctieFromUser:', error.message, error.stack);
        throw new Error('Removing functie from user failed');
    }
}

module.exports = {
    getAllFuncties,
    addFunctie,
    removeFunctie,
    modifyFunctie,
    getFunctieById,
    addFunctieToUser,
    addFunctiesToUser,
    getFunctiesByUserId,
    removeFunctieFromUser
};
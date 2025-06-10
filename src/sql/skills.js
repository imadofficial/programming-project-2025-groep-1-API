const mysql = require('mysql2');

const dotenv = require('dotenv');

const { getPool } = require('../globalEntries.js');


dotenv.config();

async function getAllSkills() {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM skills';

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

async function addSkillToUser(id_gebruiker, id_skill) {
    const pool = getPool('ehbmatchdev');

    const query = 'INSERT INTO gebruiker_skills (id_gebruiker, id_skill) VALUES (?, ?)';

    try {
        const [result] = await pool.query(query, [id_gebruiker, id_skill]);
        return result.insertId; // Return the ID of the newly inserted record
    } catch (error) {
        console.error('Database query error in addSkillToUser:', error.message, error.stack);
        throw new Error('Adding skill to user failed');
    }

}

async function removeSkillFromUser(id_gebruiker, id_skill) {
    const pool = getPool('ehbmatchdev');

    const query = ' FROM gebruiker_skills WHERE id_gebruiker = ? AND id_skill = ?';

    try {
        const [result] = await pool.query(query, [id_gebruiker, id_skill]);
        return result.affectedRows > 0; // Return true if a row was deleted
    } catch (error) {
        console.error('Database query error in removeSkillFromUser:', error.message, error.stack);
        throw new Error('Removing skill from user failed');
    }
}

async function getSkillsByUserId(id_gebruiker) {
    const pool = getPool('ehbmatchdev');

    const query = `
        SELECT s.* 
        FROM skills s
        JOIN gebruiker_skills gs ON s.id = gs.id_skill 
        WHERE gs.id_gebruiker = ?
    `;

    try {
        const [rows] = await pool.query(query, [id_gebruiker]);
        return rows; // Return all skills associated with the user
    } catch (error) {
        console.error('Database query error in getSkillsByUserId:', error.message, error.stack);
        throw new Error('Fetching skills for user failed');
    }
}



module.exports = {
    getAllSkills,
    addSkillToUser,
    removeSkillFromUser,
    getSkillsByUserId
};
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

    const query = 'DELETE FROM gebruiker_skills WHERE id_gebruiker = ? AND id_skill = ?';

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

async function addSkill(naam) {
    const pool = getPool('ehbmatchdev');
    const query = 'INSERT INTO skills (naam) VALUES (?)';

    try {
        const [result] = await pool.query(query, [naam]);
        return result.insertId; // Return the ID of the newly inserted skill
    } catch (error) {
        console.error('Database query error in addSkill:', error.message, error.stack);
        throw new Error('Adding skill failed');
    }
}

async function removeSkill(id_skill) {
    const pool = getPool('ehbmatchdev');
    const query = 'DELETE FROM skills WHERE id = ?';

    try {
        const [result] = await pool.query(query, [id_skill]);
        return result.affectedRows > 0; // Return true if a row was deleted
    } catch (error) {
        console.error('Database query error in removeSkill:', error.message, error.stack);
        throw new Error('Removing skill failed');
    }
}

async function modifySkill(id_skill, newName) {
    const pool = getPool('ehbmatchdev');
    const query = 'UPDATE skills SET naam = ? WHERE id = ?';

    try {
        const [result] = await pool.query(query, [newName, id_skill]);
        return result.affectedRows > 0; // Return true if a row was updated
    } catch (error) {
        console.error('Database query error in modifySkill:', error.message, error.stack);
        throw new Error('Modifying skill failed');
    }
}

async function getSkillById(id_skill) {
    const pool = getPool('ehbmatchdev');
    const query = 'SELECT * FROM skills WHERE id = ?';

    try {
        const [rows] = await pool.query(query, [id_skill]);
        if (rows.length > 0) {
            return rows[0]; // Return the first row if found
        } else {
            return null; // Return null if no skill is found
        }
    } catch (error) {
        console.error('Database query error in getSkillById:', error.message, error.stack);
        throw new Error('Getting skill by ID failed');
    }
}

async function addSkillsToUser(id_gebruiker, skillIds) {
    const pool = getPool('ehbmatchdev');
    if (!Array.isArray(skillIds) || skillIds.length === 0) {
        return 0;
    }
    // Build bulk insert values
    const values = skillIds.map(id_skill => [id_gebruiker, id_skill]);
    const query = 'INSERT INTO gebruiker_skills (id_gebruiker, id_skill) VALUES ?';
    try {
        const [result] = await pool.query(query, [values]);
        return result.affectedRows > 0; // Return true if any rows were inserted
    } catch (error) {
        console.error('Database query error in addSkillsToUser:', error.message, error.stack);
        throw new Error('Adding multiple skills to user failed');
    }
}

module.exports = {
    getAllSkills,
    addSkillToUser,
    removeSkillFromUser,
    getSkillsByUserId,
    addSkill,
    removeSkill,
    modifySkill,
    getSkillById,
    addSkillsToUser
};
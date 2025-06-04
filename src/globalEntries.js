const mysql = require('mysql2');
require('dotenv').config();

const allowedDatabases = process.env.ALLOWED_DB;

const pools = {};

function getPool(dbName = 'Accounts') {
    if (!allowedDatabases.includes(dbName)) {
        throw new Error(`Access denied: Invalid database name "${dbName}"`);
    }

    if (!pools[dbName]) {
        pools[dbName] = mysql.createPool({
            host: 'localhost',
            user: process.env.USER || 'root',
            password: process.env.PASS || '',
            port: process.env.PORT || 3306,
            database: dbName,
            waitForConnections: true,
            connectionLimit: 20,
            queueLimit: 0
        }).promise();
    }

    return pools[dbName];
}

module.exports = { getPool };

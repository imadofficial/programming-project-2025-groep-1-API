const mysql = require('mysql2');
require('dotenv').config();

const allowedDatabases = JSON.parse(process.env.ALLOWED_DB);

const pools = {};

function getPool(dbName = 'Accounts') {
    if (!allowedDatabases.includes(dbName)) {
        throw new Error(`Access denied: Invalid database name "${dbName}"`);
    }

    if (!pools[dbName]) {
        pools[dbName] = mysql.createPool({
            host: process.env.SQL_HOST || 'localhost',
            user: process.env.SQL_USER || 'root',
            password: process.env.SQL_PASS || '',
            port: process.env.SQL_PORT || 3306,
            database: dbName,
            waitForConnections: true,
            connectionLimit: 20,
            queueLimit: 0
        }).promise();
    }

    return pools[dbName];
}

module.exports = { getPool };

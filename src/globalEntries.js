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
            user: srvConfig["MySQL"]["Username"],
            password: srvConfig["MySQL"]["Password"],
            port: srvConfig["MySQL"]["Port"],
            database: dbName,
            waitForConnections: true,
            connectionLimit: 20,
            queueLimit: 0
        }).promise();
    }

    return pools[dbName];
}

module.exports = { getPool };

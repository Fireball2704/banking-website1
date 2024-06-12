const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'new_user',
    password: 'password',
    database: 'bank_db'
});

module.exports = pool;

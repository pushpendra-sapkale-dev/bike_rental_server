const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

connection.connect(err => {
    if (err) {
        console.log('Error in connecting to database');
    }
    else {
        console.log('Database is successfully connected');
    }
});

module.exports = connection;
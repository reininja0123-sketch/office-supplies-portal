import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

// Create the connection pool


const pool = mariadb.createPool({
    host: process.env.MARIA_DB_HOST,
    port: Number(process.env.MARIA_DB_PORT),
    user: process.env.MARIA_DB_USER,
    // 👇 MAKE SURE THIS MATCHES YOUR ENV VARIABLE NAME EXACTLY
    password: process.env.MARIA_DB_PASSWORD,
    database: process.env.MARIA_DB_NAME,
    connectionLimit: 5,
    bigIntAsNumber: true,
    decimalAsNumber: true
});

export default pool;
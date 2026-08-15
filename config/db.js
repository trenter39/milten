import mysql from 'mysql2/promise';
import { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } from './conf.js';

const db = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
});

export default db;

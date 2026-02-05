import dotenv from 'dotenv';
dotenv.config();

export const {
    PORT,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD
} = process.env;
require('dotenv').config()

const {Pool} = require('pg')

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
    connectionLimit: 50000,
    queueLimit: 50000,
    acquireTimeout: 1000000000000,
    UV_THREADPOOL_SIZE: 1024
})

module.exports = {pool}
import pg from 'pg'
const { Pool } = pg
import fs from 'node:fs'
import 'dotenv/config.js'

const connectionString = process.env.DATABASE_URL
const config = {
    connectionString,
}
if (process.env.DATABASE_SSL_REQUIRED === 'true') {
    config.ssl = {
        require: true,
        rejectUnauthorized: true,
    }
}
//console.log(config)
const pool = new Pool(config)

try {
    await pool.connect()
    console.log('Connected to database')
} catch (err) {
    throw new Error(`Error connecting to database ${err.stack}`)
}

export default pool

// The unconventional serial nature of this is to ensure DB schema is initialized before any other operations are performed
// and that they are executed in order (i.e. future tables depend on previous tables)
export async function initDatabaseSchema(initSqlFilePath) {
    console.log(
        'Requested to initialize schema in database automatically from contents of file: ',
        initSqlFilePath
    )

    const initsql = fs.readFileSync(initSqlFilePath).toString()
    const sqls = initsql.split(';')
    for (const sql of sqls) {
        //console.log("Executing the following SQL to initialize schema in database: ", sql);
        try {
            await pool.query(sql)
            console.log('Executed SQL successfully')
        } catch (err) {
            throw new Error(`Error executing SQL ${err.stack} for SQL: ${sql}`)
        }
    }
    console.log('Complete Schema initialized successfully')
}

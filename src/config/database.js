import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
});

pool.connect()
  .then(() => console.log('Connected to database'))
  .catch((err) => {throw new Error(`Error connecting to database ${err.stack}`)});

export default pool;
import pool from '../config/database.js'

const User = {
    create: async ({ email, password }) => {
        const result = await pool.query(
            'INSERT INTO users (email, password, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [
                email,
                password,
                new Date(new Date().toISOString()),
                new Date(new Date().toISOString()),
            ]
        )
        return result.rows[0]
    },

    findByEmail: async (email) => {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        )
        return result.rows[0]
    },

    findById: async (id) => {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [
            id,
        ])
        return result.rows[0]
    },

    delete: async (id) => {
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        )
        return result.rows[0]
    },
    findOne: async (conditions) => {
        const keys = Object.keys(conditions)
        const values = Object.values(conditions)
        const query = `SELECT * FROM users WHERE ${keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ')}`
        const result = await pool.query(query, values)
        return result.rows[0]
    },
    save: async (user) => {
        const {
            id,
            email,
            password,
            resetPasswordToken,
            resetPasswordExpires,
        } = user
        const result = await pool.query(
            'UPDATE users SET email = $1, password = $2, reset_password_token = $3, reset_password_expires = $4, updated_at=$5 WHERE id = $6 RETURNING *',
            [
                email,
                password,
                resetPasswordToken,
                resetPasswordExpires,
                new Date(new Date().toISOString()),
                id,
            ]
        )
        return result.rows[0]
    },
}

export default User

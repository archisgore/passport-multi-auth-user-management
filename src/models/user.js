import pool from '../config/database.js'

const User = {
    create: async ({ email, password, emailVerified }) => {
        emailVerified = emailVerified || false
        const result = await pool.query(
            'INSERT INTO users (email, password, email_verified) VALUES ($1, $2) RETURNING *',
            [email, password, emailVerified]
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
            emailVerified,
            password,
            resetPasswordToken,
            resetPasswordExpires,
        } = user
        const result = await pool.query(
            'UPDATE users SET email = $1, email_verified = $2, password = $3, reset_password_token = $4, reset_password_expires = $5, updated_at=$6::timestamptz WHERE id = $7 RETURNING *',
            [
                email,
                emailVerified,
                password,
                resetPasswordToken,
                resetPasswordExpires,
                new Date(new Date().toISOString()),
                id,
            ]
        )
        console.log("DB User:", result.rows[0])
        return result.rows[0]
    },
}

export default User

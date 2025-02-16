import pool from '../config/database.js'

function sqlConditionsWithComparator(conditions, comparator, indexOffset) {
    if (!conditions) {
        return [[], []]
    }
    const keys = Object.keys(conditions)
    const values = Object.values(conditions)
    const serializedConditions = keys.map(
        (key, index) => `${key} ${comparator} $${index + indexOffset}`
    )
    return [serializedConditions, values]
}

const User = {
    create: async ({ email, password, email_verified }) => {
        email_verified = email_verified || false
        const result = await pool.query(
            'INSERT INTO users (email, password, email_verified) VALUES ($1, $2, $3) RETURNING *',
            [email, password, email_verified]
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
        if (Object.keys(conditions).length === 0) {
            throw new Error('No conditions provided')
        }
        const [equalConditions, equalValues] = sqlConditionsWithComparator(
            conditions.eq,
            '=',
            1
        )
        const [greaterThanConditions, greaterThanValues] =
            sqlConditionsWithComparator(
                conditions.gt,
                '>',
                equalValues.length + 1
            )
        const [lessThanConditions, lessThanValues] =
            sqlConditionsWithComparator(
                conditions.lt,
                '<',
                equalValues.length + greaterThanValues.length + 1
            )
        const serializedConditions = [
            ...equalConditions,
            ...greaterThanConditions,
            ...lessThanConditions,
        ]
        const values = [...equalValues, ...greaterThanValues, ...lessThanValues]
        const joinedConditions = serializedConditions.join(' AND ')
        const query = `SELECT * FROM users WHERE ${joinedConditions}`
        const result = await pool.query(query, values)
        return result.rows[0]
    },
    save: async (user) => {
        const {
            id,
            email,
            email_verified,
            password,
            google_id,
            apple_id,
            facebook_id,
            twitter_id,
            reset_password_token,
            reset_password_expires,
        } = user
        const result = await pool.query(
            'UPDATE users SET email = $1, email_verified = $2, password = $3, google_id=$4, apple_id=$5, facebook_id=$6, twitter_id=$7, reset_password_token = $8, reset_password_expires = $9, updated_at=$10::timestamptz WHERE id = $11 RETURNING *',
            [
                email,
                email_verified,
                password,
                google_id,
                apple_id,
                facebook_id,
                twitter_id,
                reset_password_token,
                reset_password_expires,
                new Date(),
                id,
            ]
        )
        return result.rows[0]
    },
}

export default User

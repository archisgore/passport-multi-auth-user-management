CREATE TABLE
    users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL
            DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL
            DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'),
        reset_password_expires TIMESTAMP,
        reset_password_token VARCHAR(255)
    );
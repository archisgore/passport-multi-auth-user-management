# Passport.js Express Application

This is a complete Passport.js Express application that utilizes various authentication strategies including Local, Google, Facebook, Apple, but NOT Twitter (which uses the other oauth1.0 library which caused problems). The application is designed to manage user profiles with features for signing up, deleting profiles, and changing passwords, resetting forgotten passwords.

It uses PostgreSQL database for backend storage (since I mainly use Heroku and old habits die hard.)

## WARNING: NOT SECURE

This app stores hashed passwords in a simple flat database. This is not remotely GDPR or privacy complaint. DO NOT use this to store PII unless you know what you are doing. Do NOT say you weren't warned because this is your explicit warning. Keep your users safe.

## Features

- User authentication using Local strategy and social logins (Google, Facebook, Apple, ~~Twitter~~)
- User signup and login
- Password reset functionality
- User profile management (view and delete profiles)
- All social logins reconcile to the same user based on their email

## Technologies Used

- Node.js
- Express.js
- Passport.js
- PostgreSQL
- EJS (Embedded JavaScript templating)

## Initialize Database
Run commands from `initdb.sql` in your PostgreSQL instance to get all the tables this app requires.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd passport-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Modify the `.env` file in the root directory and add your environment variables, including database connection strings and API keys for social logins.

4. Start the application:
   ```
   npm start
   ```

## Usage

- Navigate to `http://localhost:3000` to access the application.
- Users can sign up, log in, and manage their profiles.
- Social login options are available for Google, Facebook, Apple, ~~Twitter~~.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
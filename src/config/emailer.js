import nodemailer from 'nodemailer'
import mailgun from 'nodemailer-mailgun-transport'
import 'dotenv/config.js'

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const mailgunOptions = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
    },
}
const emailer = nodemailer.createTransport(mailgun(mailgunOptions))

export default emailer

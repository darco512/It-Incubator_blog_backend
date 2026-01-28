import nodemailer from "nodemailer"

export class EmailAdapter {

    static async sendEmail(email: string, subject: string, messageBody: string) {
        console.log('=== EMAIL SENDING START ===')
        console.log('From:', process.env.EMAIL_FROM)
        console.log('To:', email)
        
        // Use OAuth2 if credentials are available (works on Render via HTTPS)
        const useOAuth = process.env.GMAIL_CLIENT_ID && 
                         process.env.GMAIL_CLIENT_SECRET && 
                         process.env.GMAIL_REFRESH_TOKEN
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: useOAuth ? {
                type: 'OAuth2',
                user: process.env.EMAIL_FROM,
                clientId: process.env.GMAIL_CLIENT_ID,
                clientSecret: process.env.GMAIL_CLIENT_SECRET,
                refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            } : {
                user: process.env.EMAIL_FROM,
                pass: process.env.EMAIL_FROM_PASSWORD,
            },
            connectionTimeout: 5000,
            greetingTimeout: 3000,
            socketTimeout: 5000,
        })
        
        const result = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: subject,
            html: messageBody,
        })
        
        console.log(`✅ Email sent via ${useOAuth ? 'OAuth2' : 'App Password'}!`, result.messageId)
        console.log('=== EMAIL SENDING END ===')
        return result
    }
}

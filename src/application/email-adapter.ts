import nodemailer from "nodemailer"

export class EmailAdapter {

    static async sendEmail(email: string, subject: string, messageBody: string) {
        console.log('=== EMAIL SENDING START ===')
        console.log('From:', process.env.EMAIL_FROM)
        console.log('To:', email)
        console.log('📧 Using SMTP')
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
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
        
        console.log('✅ Email sent via SMTP!', result.messageId)
        console.log('=== EMAIL SENDING END ===')
        return result
    }
}

import nodemailer from "nodemailer"

export class EmailAdapter {

    static async sendEmail(email: string, subject: string, messageBody: string) {
        console.log('=== GMAIL SENDING START ===')
        console.log('From:', process.env.EMAIL_FROM)
        console.log('To:', email)
        
        try {
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // Use STARTTLS
                auth: {
                    user: process.env.EMAIL_FROM,
                    pass: process.env.EMAIL_FROM_PASSWORD,
                },
                // Fast timeouts to fit in 6000ms test window
                connectionTimeout: 5000,   // 5 seconds
                greetingTimeout: 3000,     // 3 seconds  
                socketTimeout: 5000,       // 5 seconds
                tls: {
                    rejectUnauthorized: false,
                    minVersion: 'TLSv1.2'
                }
            })
            
            // Verify connection before sending
            await transporter.verify()
            console.log('✅ Gmail SMTP connected')
            
            const result = await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: email,
                subject: subject,
                html: messageBody,
            })
            
            console.log('✅ Email sent!', result.messageId)
            console.log('=== GMAIL SENDING END ===')
            return result
            
        } catch (error: any) {
            console.error('❌ Gmail SMTP Error:', error.message)
            console.error('Error code:', error.code)
            console.log('=== GMAIL SENDING FAILED ===')
            throw error
        }
    }
}

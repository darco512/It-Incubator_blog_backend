import nodemailer from "nodemailer"
import { google } from 'googleapis'

export class EmailAdapter {

    static async sendEmail(email: string, subject: string, messageBody: string) {
        console.log('=== EMAIL SENDING START ===')
        console.log('From:', process.env.EMAIL_FROM)
        console.log('To:', email)
        
        // Check if OAuth2 credentials available
        const hasOAuth = !!(process.env.GMAIL_CLIENT_ID && 
                           process.env.GMAIL_CLIENT_SECRET && 
                           process.env.GMAIL_REFRESH_TOKEN)
        
        console.log('🔍 OAuth2 available:', hasOAuth)
        
        if (hasOAuth) {
            // Use Gmail API directly via HTTPS (bypasses SMTP blocking!)
            return await this.sendViaGmailAPIHTTPS(email, subject, messageBody)
        } else {
            // Fallback to SMTP (works locally)
            return await this.sendViaSMTP(email, subject, messageBody)
        }
    }
    
    // Gmail API via HTTPS - uses port 443, never blocked!
    private static async sendViaGmailAPIHTTPS(email: string, subject: string, messageBody: string) {
        console.log('📧 Using Gmail API (HTTPS - port 443)')
        
        const oauth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        )
        
        oauth2Client.setCredentials({
            refresh_token: process.env.GMAIL_REFRESH_TOKEN
        })
        
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
        
        // Create email in RFC2822 format
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
        const messageParts = [
            `From: ${process.env.EMAIL_FROM}`,
            `To: ${email}`,
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            `Subject: ${utf8Subject}`,
            '',
            messageBody
        ]
        const message = messageParts.join('\n')
        
        // Encode message in base64
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')
        
        const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        })
        
        console.log('✅ Email sent via Gmail API (HTTPS)!', result.data.id)
        return result.data
    }
    
    // SMTP fallback for local development
    private static async sendViaSMTP(email: string, subject: string, messageBody: string) {
        console.log('📧 Using SMTP (may fail on Render)')
        
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
        
        return await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: subject,
            html: messageBody,
        })
    }
}

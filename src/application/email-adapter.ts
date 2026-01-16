import nodemailer from "nodemailer"

export class EmailAdapter {

    static async sendEmail(email: string, subject: string, messageBody: string) {
        console.log(process.env.EMAIL_FROM)
        console.log("Email will be send")
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_FROM,
                pass: process.env.EMAIL_FROM_PASSWORD,
            },
        })
        transporter.sendMail({
            from: "Tony <darcohaha@gmail.com>",
            to: email,
            subject: subject,
            html: messageBody,
        })

    }
}

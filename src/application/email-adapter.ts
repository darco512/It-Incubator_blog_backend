import nodemailer from "nodemailer"

export class EmailAdapter {

    static async sendEmail(email: string, subject: string, messageBody: string) {
        console.log(process.env.EMAIL_FROM)
        console.log("Email will be send")
        let transporter = nodemailer.createTransport({
            service: 'gmail',                              // the service used
            auth: {
                user: process.env.EMAIL_FROM,              // authentication details of sender, here the details are coming from .env file
                pass: process.env.EMAIL_FROM_PASSWORD,
            },
        })
        return await transporter.sendMail({
            from: "Tony <darcohaha@gmail.com>",
            to: email,
            subject: subject,
            html: messageBody,
        })

    }
}

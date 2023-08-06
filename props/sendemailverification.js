const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN })
const sendEmail = (name, id, email, token) => {

    const verificationLink = `${process.env.HOST}/api/v1/auth/verify/${id}/${token}`
    const messageEmailVerify = `<!DOCTYPE html>
        <html>
        <head>
          <title>Verify Your Email Address - Crowd Funding Services</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Verify Your Email Address - Crowd Funding Services</h2>
          <p>Dear ${name},</p>
          <p>Thank you for joining Crowd Funding Services! We are thrilled to have you as a part of our community. Before we get started, we need to verify your email address to ensure the security of your account.</p>
          <p>To complete the verification process, simply click on the link below:</p>
          <p><a href="${verificationLink}">Verify Your Email Address</a></p>
          <p>If the link above does not work, you can copy and paste the following URL into your browser:</p>
          <p>${verificationLink}</p>
          <p>Please note that this link will expire after [time period], so make sure to verify your email address as soon as possible.</p>
          <p>By verifying your email, you'll gain full access to our platform and receive updates on exciting crowdfunding opportunities tailored to your interests.</p>
          <p>If you did not sign up for an account with Crowd Funding Services, or if you have any questions or concerns, please contact our support team at [support email or phone number].</p>
          <p>Thank you for choosing Crowd Funding Services. We look forward to helping you bring your dreams to life!</p>
          <b><p>Best regards,<br>The Crowd Funding Services Team</p></b>
        </body>
        </html>`

    const mailInfo = {
        from: `Crowd Funding Services < ${process.env.VERIFICATION_EMAIL_SENDER} >`,
        to: email,
        subject: "Verify Your Email Address - Crowd Funding Services",
        html: messageEmailVerify
    }
    mailgun.messages().send(mailInfo, function (err, body) {
        if (err) {
            console.log(err)
        }
        else{
            console.log(body)
        }
    })
}

module.exports = sendEmail

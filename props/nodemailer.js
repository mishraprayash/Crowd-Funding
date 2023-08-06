const nodeMailer = require('nodemailer')

// we can pass the required arguments when we call the function and can generate a required link in the emailHTML.
async function sendEmail() {
  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Verify Your Email Address - Crowd Funding Services</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Verify Your Email Address - Crowd Funding Services</h2>
    <p>Dear Prayash,</p>
    <p>Thank you for joining Crowd Funding Services! We are thrilled to have you as a part of our community. Before we get started, we need to verify your email address to ensure the security of your account.</p>
    <p>To complete the verification process, simply click on the link below:</p>
    <p>Verify Your Email Address</p>
    <p>If the link above does not work, you can copy and paste the following URL into your browser:</p>
    <p>Please note that this link will expire after [time period], so make sure to verify your email address as soon as possible.</p>
    <p>By verifying your email, you'll gain full access to our platform and receive updates on exciting crowdfunding opportunities tailored to your interests.</p>
    <p>If you did not sign up for an account with Crowd Funding Services, or if you have any questions or concerns, please contact our support team at [support email or phone number].</p>
    <p>Thank you for choosing Crowd Funding Services. We look forward to helping you bring your dreams to life!</p>
    <b><p>Best regards,<br>The Crowd Funding Services Team</p></b>
  </body>
  </html>
  `;
  const transporter = nodeMailer.createTransport({
    service:'gmail',
    port: 465,
    secure: true,
    auth: {
      user: process.env.AUTH_USER,
      pass: process.env.AUTH_PASS

    }

  })
  const info = {
    from: '<sending email>',
    to: '<link receiving email>',
    subject: 'Email Verification',
    html: emailHtml
  }

  transporter.sendMail(info, (err, info) => {
    if (err) {
      console.log('Error occured couldnot send the verification link',err)
      return;
    }
    console.log('Email sent successfully', info);
  })

}
sendEmail()
.catch((err)=> {
  console.log(err)
})


const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const { verify } = require('jsonwebtoken')
const Token = require('../models/tokenSchema')
const crypto = require('crypto')
const { truncateSync } = require('fs')

const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN })

const register = async (req, res, next) => {
    try {
        const user = await User.create({ ...req.body })
        const jwtToken = await user.createJWT()

        // created new token schema where we store the id of created user as userId and create a new token so that we can verify
        // it later thorugh verify endpoint accessing this same id and token.

        const token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex")
        }).save()
        const verificationLink = `${process.env.HOST}/api/v1/auth/verify/${token.userId}/${token.token}`
        const message = `<!DOCTYPE html>
        <html>
        <head>
          <title>Verify Your Email Address - Crowd Funding Services</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Verify Your Email Address - Crowd Funding Services</h2>
          <p>Dear ${user.name},</p>
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
            to: user.email,
            subject: "Verify Your Email Address - Crowd Funding Services",
            html: message
        }
        mailgun.messages().send(mailInfo, function (err, body) {
            if (err) {
                // console.log('Error occured while sending email: ', err)
                return res.status(404).json({ error: err.message })
            }
        })
        return res.status(StatusCodes.CREATED).json({ user: { name: user.name }, jwtToken })
    } catch (error) {
        next(error)
    }
}
const login = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        throw new BadRequestError('Please provide email and password')
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new UnauthenticatedError('Unauthorized user')
    }
    const isCorrect = await user.checkPassword(password)
    if (!isCorrect) {
        throw new UnauthenticatedError('Incorrect password')
    }
    const jwtToken = await user.createJWT()
    res.status(StatusCodes.CREATED).json({ user: { name: user.name }, jwtToken })
}
const forgotPassword = async (req, res) => {

    //     const user=User.findOne({email:req.body.email})
    //     if(!user){
    //         throw new NotFoundError(`user with email:${req.body.email} is not found`)
    //     }
    //     const resetToken= await User.createResetToken()
    //    await User.save();
    res.json('forgot password')
}
const resetPassword = async (req, res) => {
    res.json('reset password')
}

const verifyEmail = async (req, res, next) => {
    try {
        const { id, token } = req.params
        const user = await Token.findOne({ userId: id })
        if (!user) {
            return res.status(404).json({
                message: "Wrong Verification Link"
            })
        }
        if (user.expiresAt < Date.now()) {
            return res.status(404).json({
                message: 'Link Expired'
            })
        }

        // update the user and verify email
        await User.findOneAndUpdate({ _id: user.userId }, { $set: { verified: true } })

        // delete the token for this user after verification 
        await Token.findOneAndDelete({ userId: id })
        
        res.status(200).json({
            message: 'User verified'
        })

    } catch (error) {
        next(error)
    }

}

module.exports = {
    register, login, forgotPassword, resetPassword, verifyEmail
}
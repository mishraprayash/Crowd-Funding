
const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const { verify } = require('jsonwebtoken')
const Token = require('../models/tokenSchema')
const crypto = require('crypto')
const { truncateSync } = require('fs')

const sendEmail = require('../props/sendemailverification')

const register = async (req, res, next) => {
    try {
        const user = await User.create({ ...req.body })
        const jwtToken = await user.createJWT()
        // email link token
        const token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex")
        }).save()
        try {
            sendEmail(user.name, token.userId, user.email, token.token)
        } catch (error) {
            return res.json({
                message: "Verification email not sent",
                error: error.message
            })
        }
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
    res.status(StatusCodes.CREATED).json({ message: "Login Sucess", user: { name: user.name }, jwtToken })
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
        const { id } = req.params
        const user = await Token.findOne({ userId: id })
        if (!user) {
            return res.status(404).json({
                message: "Invalid link or Link expired"
            })
        }
        // verify email 
        await User.findOneAndUpdate({ _id: user.userId }, { $set: { verified: true } })

        // delete the token for this user after verification 
        await Token.findOneAndDelete({ userId: id })

        res.status(200).json({
            message: 'User has been verified'
        })

    } catch (error) {
        next(error)
    }

}

module.exports = {
    register, login, forgotPassword, resetPassword, verifyEmail
}
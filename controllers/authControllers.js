const Employee = require('../models/Employee')
const Vendor = require('../models/Vendor')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer')
const maxAge = 3 * 24 * 60 * 60 * 10000

const handleErrors = (err) => {
    console.log(err.message)
    let errors = { email: '', password: '' }
    if (err.message === 'incorrect email') { errors.email = 'Please enter a valid email' }
    if (err.message === 'incorrect password') { errors.password = 'Incorrect password' }
    return errors
}


module.exports.getLogin = async (req, res) => {
    req.session.destroy()
    const token = req.cookies.myCookie
    if (token) {
        await jwt.verify(token, process.env.jwtSecret, async (err, decodedToken) => {
            if (err) return res.render('login');
            else {
                const id = decodedToken.id
                const employee = await Employee.findOne({ _id: id });
                if (employee) return res.redirect('/home');
                const vendor = await Vendor.findOne({ _id: id });
                if (vendor) return res.redirect('/vendor')
                return res.render('login')
            }
        })
    }
    else return res.render('login')
}

module.exports.postLogin = async (req, res) => {
    let email = req.body.email
    try {
        var isFound = false
        await Employee.findOne({ email })
        .then(async (employee)=>{
            if (employee) {
                isFound = true
                await bcrypt.compare(req.body.password, employee.password)
                .then((pwdCompare)=>{
                    if (pwdCompare) {
                        const id = employee._id
                        const authToken = jwt.sign({ id }, process.env.jwtSecret, { expiresIn: maxAge })
                        console.log('Employee ', employee.name.first, 'logged in')
                        res.cookie('myCookie', authToken, { httpOnly: true, maxAge: maxAge })
                        return res.status(200).json({ employee: employee._id })
                    }
                    else throw Error('incorrect password')
                })
            }
        })
        await Vendor.findOne({email})
        .then(async(vendor)=>{
            if (vendor) {
                isFound = true
                await bcrypt.compare(req.body.password, vendor.password)
                .then((pwdCompare)=>{
                    if (pwdCompare) {
                        const id = vendor._id
                        const authToken = jwt.sign({ id }, process.env.jwtSecret, { expiresIn: maxAge })
                        console.log('Vendor ', vendor.firstName, 'logged in')
                        res.cookie('myCookie', authToken, { httpOnly: true, maxAge: maxAge })
                        return res.status(200).json({ vendor: vendor._id })
                    }
                    else throw Error('incorrect password')
                })
            }

        })
        if (!isFound) throw Error('incorrect email')
    } catch (err) {
        const error = handleErrors(err)
        return res.status(400).json({ error })
    }
}

module.exports.getLogout = async (req, res) => {
    console.log('Logged out')
    res.status(200).clearCookie('myCookie').render('logout')
}

module.exports.postLogout = async (req, res) => {
    res.redirect('/login')
}

module.exports.getForgotPassword = async (req, res) => {
    res.render('forgotPassword')
}

module.exports.postForgotPassword = async (req, res) => {
    try {
        const employee = await Employee.findOne({ email: req.body.email })
        const vendor = await Vendor.findOne({ email: req.body.email })
        const user = employee ? employee : vendor
        if (user) {
            const otp = otpGenerator.generate(8, { digits: true, alphabets: true, upperCase: true, specialChars: false });
            const mailOptions = {
                from: process.env.ID,
                to: user.email,
                subject: 'Forgot Password OTP',
                html: `
                    <h2>Forgot Password OTP</h2>
                    <p>Your One-Time Password (OTP) for resetting your password is: ${otp}</p>
                    <h1>${otp}</h1>
                    <p>Please use this OTP to verify your identity and reset your password.</p>
                    <p>If you didn't request a password reset, you can safely ignore this email.</p>
                    <p>Thanks,<br>DarwinTrade</p>`
            };
            const salt = await bcrypt.genSalt(10)
            const otp_ = await bcrypt.hash(otp, salt);
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.ID,
                    pass: process.env.PASSWORD,
                },
            });
            req.session.email=user.email
            req.session.otp=otp_
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    res.status(400).json({ success: false, error: error.message });
                } else {
                    console.log('OTP Sent to ', user.email)
                    res.status(200).json({ success: true, otp: otp_ });
               }
            });
        } else {
            throw ('incorrect email')
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, error: 'Please enter a valid email.' });
    }
}

module.exports.getVerifyOTP = async (req, res) => {
    res.render('verifyOTP')
}

module.exports.postVerifyOTP = async (req, res) => {
    try {
        const otpCompare = await bcrypt.compare(req.body.otp, req.session.otp)
        if (otpCompare) {
            if (req.body.password == req.body.password_) {
                const email = req.session.email
                const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash(req.body.password, salt);
                const employee = await Employee.findOne({ email: email })
                const vendor = await Vendor.findOne({ email: email })
                if (employee) await Employee.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } })
                if (vendor) await Vendor.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } })
                console.log(`Password has been updated for ${email}`)
                return res.status(200).json({ success: true })
            }
            else throw ("incorrect passwords")
        }
        else throw ('incorrect otp')

    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false, error });
    }
}


const jwt = require('jsonwebtoken')
const Employee = require('../models/Employee')
const Vendor = require('../models/Vendor')

const requireAuth = (req, res, next)=> {
    const token = req.cookies.myCookie
    if(token) {
        jwt.verify(token, process.env.jwtSecret, (err, decodedToken)=> {
            if(err) res.redirect('/login')
            else {
                req.user = decodedToken
                next()
            }
        })
    }
    else res.redirect('/login')
}

const checkEmployee = async(req, res, next) =>{
    const token = req.cookies.myCookie
    if(token) {
        await jwt.verify(token, process.env.jwtSecret, async(err, decodedToken)=> {
            if(err) {
                res.locals.employee = null
                res.locals.vendor = null
                next()
            }
            else {
                let employee = await Employee.findById(decodedToken.id)
                let vendor = await Vendor.findById(decodedToken.id)
                if(vendor) {res.locals.vendor = vendor; res.locals.employee = null}
                if(employee) {res.locals.employee = employee; res.locals.vendor = null}
                next()
            }
        })
    }
    else {
        res.locals.employee = null
        res.locals.vendor = null
        next()
    }
}

module.exports = { requireAuth, checkEmployee }

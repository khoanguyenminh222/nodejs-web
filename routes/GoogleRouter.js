const express = require('express')
const Router = express.Router()
const passport = require('passport')

Router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

Router.get('/auth/google/callback',
    passport.authenticate('google', { successRedirect: '/student/addMongodb', failureRedirect: '/' }),
    function(req, res) {
        res.redirect('/login')
    })

module.exports = Router
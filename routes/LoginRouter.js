require("dotenv").config();
const express = require('express')
const Router = express.Router()

const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')
const registerValidator = require('./validators/registerValidator')
const loginValidator = require('./validators/loginValidator')
const jwt = require('jsonwebtoken')


const Account = require('../models/AccountModel')


Router.get('/', (req, res) => {
    res.render('dangnhap', { errMessage: '', username: '' })
})


Router.post('/', loginValidator, (req, res) => {
    let result = validationResult(req)
    if (result.errors.length === 0) {
        let { username, password } = req.body
        Account.findOne({ username: username })

        .then(acc => {
                if (!acc) {
                    throw new Error('Username không tồn tại')
                }
                data = acc
                return bcrypt.compare(password, acc.password)
            })
            .then(passwordMatch => {

                if (!passwordMatch) {
                    //return res.status(401).json({ code: 3, message: 'Đăng nhập thất bại, mật khẩu không chính xác' })
                    return res.render('dangnhap', { errMessage: 'Đăng nhập thất bại, mật khẩu không chính xác', username: username })
                }
                // kiểm tra để trả về view admin hoặc quản lý
                if (data.chucvu === 'admin') {
                    req.session.data = data
                    return res.redirect('/')
                } else if (data.chucvu === 'Quanly') {
                    req.session.data = data
                    return res.redirect('/quanly')
                }



            })

        .catch(e => {
            console.log("lỗi")
            return res.render('dangnhap', { errMessage: 'Đăng nhập thất bại ' + e.message, username: username })
        })
    } else {
        let { username, password } = req.body
        let messages = result.mapped()
        let message = ''
        for (m in messages) {
            message = messages[m].msg
            break
        }
        return res.render('dangnhap', { errMessage: message, username: username })
    }
})
Router.post('/register', registerValidator, (req, res) => {
    let result = validationResult(req)
    if (result.errors.length === 0) {

        let { username, password, phong_khoa, chuyenmuc, chucvu } = req.body
        Account.findOne({ username: username })
            .then(acc => {
                if (acc) {
                    throw new Error('{Username} này đã tồn tại')
                }
            })
            .then(() => bcrypt.hash(password, 10))
            .then(hashed => {

                let user = new Account({
                    username,
                    password: hashed,
                    phong_khoa,
                    image: {
                        data: "/images/TDT.png",
                        contentType: 'image/png'
                    },
                    chuyenmuc: chuyenmuc,
                    chucvu
                })
                return user.save()
            })
            .then(() => {
                return res.json({ code: 0, message: 'Đăng ký tài khoản thành công ' })

            })

        .catch(e => {
            return res.json({ code: 2, message: 'Đăng ký tài khoản thất bại ' + e.message })
        })

    } else {
        let messages = result.mapped()
        let message = ''
        for (m in messages) {
            message = messages[m].msg
            break
        }
        return res.json({ code: 1, message: message })
    }
})

module.exports = Router
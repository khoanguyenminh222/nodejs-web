require("dotenv").config();
const express = require('express')
const bcrypt = require('bcrypt')
const Router = express.Router()

const { validationResult } = require('express-validator')
const registerValidator = require('./validators/registerValidator')

const Account = require('../models/AccountModel')
const Student = require('../models/StudentModel');
const BaiViet = require('../models/BaiVietModel');
const BinhLuan = require('../models/BinhLuanModel');

const isLoggedIn = (req, res, next) => {
    if (req.session.data) {
        next();
    } else {
        res.redirect('/login');
    }
}

const checkAdmin = (req, res, next) => {
    data = req.session.data
    Account.findOne({ username: data.username })
        .then(acc => {
            if (acc.chucvu === 'admin') {
                next()
            } else {
                res.redirect('/quanly');
            }
        })
        .catch(e => {
            res.send(e.message)
        })
}

/// render trang bài viết
Router.get('/', isLoggedIn, checkAdmin, (req, res, next) => {
    let data = req.session.data
    Promise.all([Student.find({}), BaiViet.find({}).sort({ thoigian: -1 }), BinhLuan.find({}).sort({ thoigian: 1 }), Account.find({})])
        .then(result => {
            const [allstudent, allbaiviet, allbinhluan, allaccount] = result
            res.render('trangchuAdmin', { page: 'baivietadmin', student: req.session.student, allbaiviet: allbaiviet, allstudent: allstudent, allbinhluan: allbinhluan, allaccount: allaccount, data: data, title: 'Trang chủ' })
        })
})
Router.get('/dangxuat', (req, res) => {
    req.session.destroy()
    res.redirect('/login');
})


///Tạo tài khoản
Router.get('/taotaikhoan', isLoggedIn, checkAdmin, (req, res) => {
    data = req.session.data
    Account.find({ chucvu: { $eq: "Quanly" } }, (err, user) => {
        if (err) {
            res.render('trangchuAdmin', { page: 'taotaikhoan', data: data, users: [], title: 'Tạo tài khoản' })
        } else {
            req.session.user = user
            res.render('trangchuAdmin', { page: 'taotaikhoan', data: data, users: user, title: 'Tạo tài khoản' })
        }
    })
})

Router.get('/taotaikhoan/add', isLoggedIn, checkAdmin, (req, res) => {
    res.redirect('/taotaikhoan');
})

Router.post('/taotaikhoan/add', isLoggedIn, registerValidator, (req, res) => {
    // thêm tài khoản người dùng
    let { username, password, phong_khoa, chuyenmuc } = req.body
    let result = validationResult(req)
    let errorMessage = ""


    if (result.errors.length === 0) {

        Account.findOne({ $or: [{ phong_khoa: phong_khoa }, { username: username }] })
            .then(acc => {
                if (acc) {
                    throw new Error(`Đã tồn tại ${username} hoặc ${phong_khoa}`)
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
                    chuyenmuc,
                })
                return user.save()
            })
            .then(() => {
                successMessage = "Tạo tài khoản thành công. Cần load lại trang"
                return res.render('trangchuAdmin', { page: 'taotaikhoan', successMessage, successMessage1: '', data: req.session.data, users: req.session.user, title: 'Tạo tài khoản' })


            })
            .catch(e => {
                errorMessage = e.message

                return res.render('trangchuAdmin', { page: 'taotaikhoan', errorMessage, data: req.session.data, users: req.session.user, title: 'Tạo tài khoản' })
                    //return errorMessage
            })

    } else {
        let messages = result.mapped()
        let message = ''
        for (m in messages) {
            message = messages[m].msg
            break
        }
        errorMessage = message


        return res.render('trangchuAdmin', { page: 'taotaikhoan', errorMessage, data: req.session.data, users: req.session.user, title: 'Tạo tài khoản' })
            //return errorMessage
    }

})

/// Chỉnh sửa chuyên mục
Router.get('/taotaikhoan/edit/:id', isLoggedIn, checkAdmin, (req, res) => {
    Account.findOne({ _id: req.params.id }, (err, user) => {
        req.session.chinhsuauser = user
        if (err) {
            res.render('trangchuAdmin', { page: 'chinhsuachuyenmuc', data: req.session.data, user: [], title: 'Chỉnh sửa chuyên mục' })
        } else {
            res.render('trangchuAdmin', { page: 'chinhsuachuyenmuc', data: req.session.data, user: user, title: 'Chỉnh sửa chuyên mục' })
        }
    })
})

Router.post('/taotaikhoan/edit/:id', isLoggedIn, checkAdmin, (req, res) => {
    id = req.params.id
    if (!req.body.chuyenmuc) {
        res.render('trangchuAdmin', { page: 'chinhsuachuyenmuc', errorMessage: "Cần tối thiểu 1 chuyên mục", data: req.session.data, user: req.session.chinhsuauser, title: 'Chỉnh sửa chuyên mục' })
    } else {
        Account.updateOne({ _id: id }, { $set: { chuyenmuc: req.body.chuyenmuc } }, function(err, user) {
            if (err) {
                throw err
            } else {
                res.render('trangchuAdmin', { page: 'chinhsuachuyenmuc', successMessage: "Cập nhật thành công", data: req.session.data, user: req.session.chinhsuauser, title: 'Chỉnh sửa chuyên mục' })
            }


            //return res.render('trangchuAdmin', { page: 'taotaikhoan', successMessage1: 'Cập nhật thành công', data: req.session.data, users: req.session.user })
        })
    }
})

Router.get('/trangnguoidung/:id', isLoggedIn, checkAdmin, (req, res) => {
    let id = req.params.id
    Promise.all([Student.find({}), Student.findById(id), BaiViet.find({}).sort({ thoigian: -1 }), BinhLuan.find({}).sort({ thoigian: 1 }), Account.find({})])
        .then(result => {
            const [allstudent, nguoidung, allbaiviet, allbinhluan, allaccount] = result
            res.render('trangchuAdmin', { page: 'trangnguoidung_admin', nguoidung: nguoidung, student: req.session.student, allbaiviet: allbaiviet, allstudent: allstudent, allbinhluan: allbinhluan, allaccount: allaccount, data: data, title: nguoidung.fullname })
        })
})

module.exports = Router
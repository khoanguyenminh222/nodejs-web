const express = require('express')
var fs = require('fs');
var path = require('path');
const bcrypt = require('bcrypt')
var formidable = require('formidable');
var moment = require('moment-timezone')

const Router = express.Router()

const Account = require('../models/AccountModel')
const Student = require('../models/StudentModel');
const BaiViet = require('../models/BaiVietModel');
const BinhLuan = require('../models/BinhLuanModel');
const ThongBao = require('../models/ThongBaoModel')

const isLoggedIn = (req, res, next) => {
    if (req.session.data) {
        next();
    } else {
        res.redirect('/login');
    }
}

const checkQuanLy = (req, res, next) => {
    data = req.session.data
    Account.findOne({ username: data.username })
        .then(acc => {
            if (acc.chucvu === 'Quanly') {
                next()
            } else {
                res.redirect('/');
            }
        })
}

Router.get('/', isLoggedIn, checkQuanLy, (req, res) => {
    data = req.session.data
    Account.find({ chucvu: { $eq: "Quanly" } }, (err, user) => {
        if (err) {
            res.render('quanly', { page: 'baivietquanly', data: data, users: [] })
        } else {
            req.session.user = user
            Promise.all([Student.find({}), BaiViet.find({}).sort({ thoigian: -1 }), BinhLuan.find({}).sort({ thoigian: 1 }), Account.find({}), ThongBao.find({ phong_khoa: data.phong_khoa }).sort({ thoigian: -1 }).limit(5)])
                .then(result => {
                    const [allstudent, allbaiviet, allbinhluan, allaccount, allthongbao] = result
                    res.render('quanly', { page: 'baivietquanly', student: req.session.student, allbaiviet: allbaiviet, allstudent: allstudent, allbinhluan: allbinhluan, allaccount: allaccount, allthongbao: allthongbao, users: user, data: data })
                })
        }
    })

})

Router.get('/doimatkhau', isLoggedIn, checkQuanLy, (req, res) => {
    data = req.session.data
    res.render('quanly', { page: 'doimatkhau', data: data })
})
Router.post('/doimatkhau', isLoggedIn, checkQuanLy, (req, res) => {
    let { password, password_moi } = req.body
    data = req.session.data
    if (!password) {
        return res.render('quanly', { page: 'doimatkhau', errorMessage: 'Yêu cầu nhập mật khẩu xác nhận', data: req.session.data })
    } else if (password_moi.length < 6) {
        return res.render('quanly', { page: 'doimatkhau', errorMessage: 'Mật khẩu mới phải tối thiểu 6 kí tự', data: req.session.data })
    } else {
        Account.findOne({ username: data.username })
            .then(acc => {
                return bcrypt.compare(password, acc.password)
            })
            .then(passwordMatch => {
                if (!passwordMatch) {
                    throw new Error('Mật khẩu xác nhận không chính xác')
                } else {
                    return bcrypt.hash(password_moi, 10)
                }
            })
            .then(hashed => {
                Account.updateOne({ username: data.username }, { $set: { password: hashed } }, function(err, user) {
                    if (err) {
                        throw err
                    } else {
                        return res.render('quanly', { page: 'doimatkhau', successMessage: 'Cập nhật thành công', data: req.session.data })
                    }
                })
            })
            .catch(e => {
                return res.render('quanly', { page: 'doimatkhau', errorMessage: e.message, data: req.session.data })
            })
    }

})


Router.post('/dangbinhluan', (req, res) => {
    var form = new formidable.IncomingForm();

    moment().format('DD-MM-YYYY');
    const today = moment().tz('Asia/Ho_Chi_Minh').format('DD-MM-YYYY HH:mm:ss');

    var fields = []
    form.parse(req, function(err, field, files) {
        const { mabaiviet, manguoidung, txtbinhluan } = field
        fields.push([mabaiviet], [manguoidung], [txtbinhluan])
    })
    form.on('end', function() {
        if (!fields[0]) {
            res.json({
                code: 1,
                message: 'ID bài viết không hợp lệ'
            })
        } else {
            let binhluan = new BinhLuan({
                mabaiviet: fields[0][0],
                manguoidung: fields[1][0],
                txtbinhluan: fields[2][0],
                thoigian: today,
            })
            binhluan.save()
            Account.findOne({ "_id": fields[1][0] }, (err, account) => {
                if (err) {
                    console.log(err)
                } else {
                    res.json({
                        code: 0,
                        mabaiviet: fields[0][0],
                        manguoidung: fields[1][0],
                        txtbinhluan: fields[2][0],
                        fullname: account.phong_khoa,
                        hinhanh: 'TDT.jpg',
                        thoigian: today
                    })
                }
            })

        }
    })
    form.on('error', function() {
        res.end('Something went wrong on ther server side. Your file may not have yet uploaded.');
    });
})

Router.get('/taothongbao', isLoggedIn, checkQuanLy, (req, res) => {
    data = req.session.data
    res.render('quanly', { page: 'taothongbao', data: data, tieude: '', noidung: '' })
})

Router.post('/taothongbao', isLoggedIn, checkQuanLy, (req, res) => {
    moment().format('DD-MM-YYYY');
    const today = moment().tz('Asia/Ho_Chi_Minh').format('DD-MM-YYYY HH:mm:ss');

    data = req.session.data
    let { tieude, noidung, chonchuyenmuc } = req.body
    if (!tieude) {
        res.render('quanly', { page: 'taothongbao', data: data, errorMessage: 'Chưa có tiêu đề', tieude, noidung })
    } else if (!noidung) {
        res.render('quanly', { page: 'taothongbao', data: data, errorMessage: 'Chưa có nội dung', tieude, noidung })
    } else if (!chonchuyenmuc) {
        res.render('quanly', { page: 'taothongbao', data: data, errorMessage: "Chưa chọn chuyên mục", tieude, noidung })
    } else {
        let thongbao = new ThongBao({
            tieude: tieude,
            noidung: noidung,
            phong_khoa: data.phong_khoa,
            chuyenmuc: chonchuyenmuc,
            thoigian: today
        })
        thongbao.save()
        res.render('quanly', { page: 'taothongbao', data: data, successMessage: "Đã tạo thông báo mới thành công", tieude: '', noidung: '' })
    }
})

Router.get('/thongbaocuatoi', isLoggedIn, checkQuanLy, (req, res) => {
    let perPage = 10
    let page = req.params.page || 1

    data = req.session.data
    ThongBao.find({ phong_khoa: data.phong_khoa }, (err, thongbao) => {
        if (err) {
            console.log(err)
        } else {
            ThongBao.countDocuments({ phong_khoa: data.phong_khoa }, (err, count) => {
                if (err) {
                    console.log(err)
                } else {
                    res.render('quanly', { page: 'thongbaocuatoi', data: data, thongbao: thongbao, current: page, pages: Math.ceil(count / perPage) })
                }
            })
        }
    }).sort({ thoigian: -1 }).skip((perPage * page) - perPage).limit(perPage)
})

Router.get('/thongbaocuatoi/:page', isLoggedIn, checkQuanLy, (req, res) => {
    let perPage = 10
    let page = req.params.page || 1

    data = req.session.data
    ThongBao.find({ phong_khoa: data.phong_khoa }, (err, thongbao) => {
        if (err) {
            console.log(err)
        } else {
            ThongBao.countDocuments({ phong_khoa: data.phong_khoa }, (err, count) => {
                if (err) {
                    console.log(err)
                } else {
                    res.render('quanly', { page: 'thongbaocuatoi', data: data, thongbao: thongbao, current: page, pages: Math.ceil(count / perPage) })
                }
            })
        }
    }).sort({ thoigian: -1 }).skip((perPage * page) - perPage).limit(perPage)
})

Router.get('/chitietthongbao/:id', isLoggedIn, checkQuanLy, (req, res) => {
    const id = req.params.id
    ThongBao.findById(id, (err, thongbao) => {
        if (err) {
            console.log(err)
        } else {
            res.render('quanly', { page: 'chitietthongbaocuaquanly', data: data, thongbao: thongbao })
        }
    })
})

Router.post('/xoathongbao', (req, res) => {
    var form = new formidable.IncomingForm();
    var fields = []
    form.parse(req, function(err, field, files) {
        const { id } = field
        fields.push(id)
    })
    form.on('end', function() {
        if (!fields[0]) {
            res.json({
                code: 1,
                message: 'ID thông báo không hợp lệ'
            })
        } else {
            ThongBao.findByIdAndDelete({ '_id': fields[0] }, function(err, thongbao) {
                if (err) {
                    console.log(err)
                } else {
                    res.json({
                        code: 0,
                        data: thongbao,
                        message: 'Xoá thông báo thành công'
                    })
                }
            })
        }
    });
    form.on('error', function() {
        res.end('Something went wrong on ther server side. Your file may not have yet uploaded.');
    });
})

Router.post('/chinhsuathongbao', (req, res) => {
    var form = new formidable.IncomingForm();
    var fields = []
    form.parse(req, function(err, field, files) {
        const { id, tieude, noidung, chuyenmuc } = field
        fields.push([id], [tieude], [noidung], [chuyenmuc])
    })
    form.on('end', function() {
        if (!fields[0]) {
            res.json({
                code: 1,
                message: 'ID thông báo không hợp lệ'
            })
        } else {
            console.log(fields[0])
            ThongBao.updateOne({ '_id': fields[0] }, { $set: { 'tieude': fields[1][0], 'noidung': fields[2][0], 'chuyenmuc': fields[3][0] } }, function(err, thongbao) {
                if (err) {
                    console.log(err)
                } else {
                    res.json({
                        code: 0,
                        data: thongbao,
                        message: 'Chỉnh sửa thông báo thành công'
                    })
                }
            })
        }
    });
    form.on('error', function() {
        res.end('Something went wrong on ther server side. Your file may not have yet uploaded.');
    });
})

Router.get('/trangnguoidung/:id', isLoggedIn, checkQuanLy, (req, res) => {
    let id = req.params.id
    Promise.all([Student.find({}), Student.findById(id), BaiViet.find({}).sort({ thoigian: -1 }), BinhLuan.find({}).sort({ thoigian: 1 }), Account.find({}), ThongBao.find({}).sort({ thoigian: -1 }).limit(5)])
        .then(result => {
            const [allstudent, nguoidung, allbaiviet, allbinhluan, allaccount, allthongbao] = result
            res.render('quanly', { page: 'trangnguoidung_quanly', nguoidung: nguoidung, student: req.session.student, allbaiviet: allbaiviet, allstudent: allstudent, allbinhluan: allbinhluan, allaccount: allaccount, allthongbao: allthongbao, data: data })
        })
})

module.exports = Router
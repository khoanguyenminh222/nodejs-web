const express = require('express')
var fs = require('fs');
var path = require('path');
const multer = require('multer')
var formidable = require('formidable');
var moment = require('moment')

const Router = express.Router()

const Student = require('../models/StudentModel');
const BaiViet = require('../models/BaiVietModel');
const BinhLuan = require('../models/BinhLuanModel');
const Account = require('../models/AccountModel')
const ThongBao = require('../models/ThongBaoModel')
const { response } = require('express');

Router.use('/uploads', express.static(__dirname + '/uploads'));

// multer để upload file

const upload = multer({
    dest: 'public/uploads/anhdaidien',
    fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
            callback(null, true)
        } else callback(null, true)
    },
    limits: { fileSize: 500000 }
})

const isLoggedIn = (req, res, next) => {

    if (req.user) {
        const email = req.user.emails[0].value
        Student.findOne({ "email": email }, (err, user) => {
            if (err) {
                console.log(err)
            } else {
                req.session.student = user
                next();
            }
        })

    } else {
        res.redirect('/');
    }
}

Router.get('/', isLoggedIn, (req, res) => {
    Promise.all([Student.find({}), BaiViet.find({}).sort({ thoigian: -1 }), BinhLuan.find({}).sort({ thoigian: 1 }), Account.find({}), ThongBao.find({}).sort({ thoigian: -1 }).limit(5)])
        .then(result => {
            const [allstudent, allbaiviet, allbinhluan, allaccount, allthongbao] = result
            res.render('student', { page: 'baivietnguoidung', student: req.session.student, allbaiviet: allbaiviet, allstudent: allstudent, allbinhluan: allbinhluan, allaccount: allaccount, allthongbao: allthongbao })
        })
})


Router.get('/addMongodb', (req, res) => {

    const email = req.user.emails[0].value
    const dotemail = email.split('@')[1]
    const fullname = req.user.displayName

    if (dotemail !== 'student.tdtu.edu.vn') {
        req.session = null
        req.logout();
        res.redirect('/error')
    } else {
        //tìm email trong mongo
        Student.findOne({ email: email })
            .then(acc => {
                if (acc) {

                    return res.redirect('/student')
                } else {
                    let student = new Student({
                        email: email,
                        fullname: fullname,
                        image: 'anhdaidien.png'
                    })
                    return student.save()
                }
            })
            .then(() => {

                return res.redirect('/student')

            })

        .catch((e) => {
            console.log('handle error: ', e.message)
        })
    }

})


Router.get('/thongtincanhan', isLoggedIn, (req, res) => {
    const email = req.session.student.email
    Student.findOne({ "email": email }, (err, data) => {
        if (err) {
            console.log(err)
            res.render('student', { page: 'thongtincanhan', student: [] })
        } else {

            res.render('student', { page: 'thongtincanhan', student: data })
        }
    })
})
Router.post('/thongtincanhan', isLoggedIn, (req, res) => {
    let { fullname, lophoc, faculty } = req.body
    if (!fullname) {
        res.render('student', { page: 'thongtincanhan', errorMessage: 'Tên hiển thị không được để trống', student: req.session.student })
    } else if (fullname.length < 6) {
        res.render('student', { page: 'thongtincanhan', errorMessage: 'Tên hiển thị phải tối thiểu 6 ký tự', student: req.session.student })
    } else if (!lophoc) {
        res.render('student', { page: 'thongtincanhan', errorMessage: 'Lớp học không được để trống', student: req.session.student })
    } else if (!faculty) {
        res.render('student', { page: 'thongtincanhan', errorMessage: 'Khoa không được để trống', student: req.session.student })
    } else {
        Student.findOne({ "email": req.session.student.email }, (err, user) => {

            Student.updateOne({ email: req.session.student.email }, { $set: { fullname: fullname, class: lophoc, faculty: faculty } }, (err) => {
                //res.render('student', { page: 'thongtincanhan', successMessage: 'Cập nhật thành công', student: user })
                res.redirect('/student/thongtincanhan')
            })
        })
    }
})

Router.get('/thongtincanhan/anhdaidien', isLoggedIn, (req, res) => {
    res.redirect('/student')
})
Router.post('/thongtincanhan/anhdaidien', isLoggedIn, (req, res) => {
    let uploader = upload.single('hinhanh')
    uploader(req, res, err => {
        let { fullname, lophoc, faculty } = req.body
        let hinhanh = req.file
        if (err) {
            res.render('student', { page: 'thongtincanhan', errorMessage1: 'Kích thước ảnh quá lớn', student: req.session.student })
        } else if (!hinhanh) {
            res.render('student', { page: 'thongtincanhan', errorMessage1: 'Chưa có hình ảnh', student: req.session.student })
        } else {
            res.set('Content-Type', 'text/html')
            Student.findOne({ "email": req.session.student.email }, (err, user) => {

                Student.updateOne({ email: req.session.student.email }, { $set: { image: hinhanh.filename } }, (err) => {
                    //res.render('student', { page: 'thongtincanhan', successMessage1: 'Cập nhật thành công', student: user })
                    res.redirect('/student/thongtincanhan')
                })
            })
        }
    })
})


Router.post('/dangtin', (req, res) => {

    var form = new formidable.IncomingForm();
    //form.parse(req)
    var filename = [];
    var fields = []
    form.parse(req, function(err, field, files) {
        const { noidung, fullname, masinhvien, anhdaidien, urlyoutube } = field
        fields.push([noidung], [fullname], [masinhvien], [anhdaidien], [urlyoutube])
    })

    moment().format('DD-MM-YYYY');
    const today1 = moment().format('DD-MM-YYYY HH:mm:ss');


    // Luu hinh anh 
    day = Date.now()
    form.on('fileBegin', function(name, file) {
        file.path = 'public/uploads/anhbaiviet/' + day + file.name;
    });

    form.on('file', function(name, file) {
        filename.push(day + file.name);
    });

    // var today = new Date()
    // let thoigianhienthi = today.getHours() + "h:" + today.getMinutes() + " " + today.getDate() + "-" + today.getMonth() + "-" + today.getFullYear()


    form.on('end', function() {
        let baiviet = new BaiViet({
            manguoidung: fields[2][0],
            noidung: fields[0][0],
            hinhanh: filename,
            thoigian: today1,
            thoigianhienthi: today1,
            video: fields[4][0]
        })
        baiviet.save()
        res.json({
            noidung: fields[0],
            fullname: fields[1],
            anhdaidien: fields[3],
            dangtinthanhcong: 'dangtinthanhcong',
            filename: filename,
            thoigian: today1,
            video: fields[4][0]
        });
    });

    form.on('error', function() {
        res.end('Something went wrong on ther server side. Your file may not have yet uploaded.');
    });
})


Router.post('/xoabaiviet', (req, res) => {

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
                message: 'ID bài viết không hợp lệ'
            })
        } else {
            BaiViet.findByIdAndDelete({ '_id': fields[0] }, function(err, baiviet) {
                if (err) {
                    console.log(err)
                } else {
                    BinhLuan.deleteMany({ 'mabaiviet': fields[0] }, function(err) {
                        if (err) {
                            console.log(err)
                        } else {
                            res.json({
                                code: 0,
                                data: baiviet,
                                message: 'Xoá bài viết thành công'
                            })
                        }
                    })
                }
            })
        }
    });
    form.on('error', function() {
        res.end('Something went wrong on ther server side. Your file may not have yet uploaded.');
    });
})

Router.post('/chinhsuabaivietcoanhmoi', (req, res) => {
    var form = new formidable.IncomingForm();

    var filename = [];
    var fields = []
    form.parse(req, function(err, field, files) {
        const { id, txtnoidung, hinhanh, anhmoi } = field
        fields.push([id], [txtnoidung], [hinhanh], [anhmoi])
    })

    // Luu hinh anh 
    day = Date.now()

    form.on('fileBegin', function(name, file) {
        file.path = 'public/uploads/anhbaiviet/' + day + file.name;
    });

    form.on('file', function(name, file) {
        filename.push(day + file.name);
    });



    form.on('end', function() {
        let hinhanh = fields[2][0] + "," + filename[0]
        hinhanh = hinhanh.split(',')
        if (!fields[0]) {
            res.json({
                code: 1,
                message: 'ID bài viết không hợp lệ'
            })
        } else {
            BaiViet.findOne({ _id: fields[0] }, (err, baiviet) => {
                if (err) {
                    console.log(err)
                } else {
                    Student.findOne({ _id: baiviet.manguoidung }, (err, student) => {
                        if (err) {
                            console.log(err)
                        } else {
                            BaiViet.updateOne({ _id: fields[0][0] }, { $set: { noidung: fields[1][0], hinhanh: hinhanh, video: '' } }, (err) => {
                                res.json({
                                    code: 0,
                                    txtnoidung: fields[1][0],
                                    hinhanh: hinhanh,
                                    fullname: student.fullname,
                                    anhdaidien: student.image,
                                    thoigianhienthi: baiviet.thoigianhienthi
                                })
                            })
                        }
                    })
                }
            })
        }
    });

    form.on('error', function() {
        res.end('Something went wrong on ther server side. Your file may not have yet uploaded.');
    });
})


Router.post('/chinhsuabaivietkhongcoanhmoi', (req, res) => {
    var form = new formidable.IncomingForm();

    var filename = [];
    var fields = []
    form.parse(req, function(err, field, files) {
        const { id, txtnoidung, hinhanh, anhmoi } = field
        fields.push([id], [txtnoidung], [hinhanh], [anhmoi])
    })

    // Luu hinh anh 
    day = Date.now()

    form.on('fileBegin', function(name, file) {
        file.path = 'public/uploads/anhbaiviet/' + day + file.name;
    });

    form.on('file', function(name, file) {
        filename.push(day + file.name);
    });



    form.on('end', function() {

        hinhanh = fields[2][0].split(',')
        if (!fields[0]) {
            res.json({
                code: 1,
                message: 'ID bài viết không hợp lệ'
            })
        } else {
            BaiViet.findOne({ _id: fields[0] }, (err, baiviet) => {
                if (err) {
                    console.log(err)
                } else {
                    Student.findOne({ _id: baiviet.manguoidung }, (err, student) => {
                        if (err) {
                            console.log(err)
                        } else {
                            BaiViet.updateOne({ _id: fields[0][0] }, { $set: { noidung: fields[1][0], hinhanh: hinhanh, video: '' } }, (err) => {
                                res.json({
                                    code: 0,
                                    txtnoidung: fields[1][0],
                                    hinhanh: hinhanh,
                                    fullname: student.fullname,
                                    anhdaidien: student.image,
                                    thoigianhienthi: baiviet.thoigianhienthi
                                })
                            })
                        }
                    })
                }
            })
        }
    });

    form.on('error', function() {
        res.end('Something went wrong on ther server side. Your file may not have yet uploaded.');
    });
})


Router.post('/koanhcuchinhsuabaivietcoanhmoi', (req, res) => {
    var form = new formidable.IncomingForm();

    var filename = [];
    var fields = []
    form.parse(req, function(err, field, files) {
        const { id, txtnoidung, anhmoi } = field
        fields.push([id], [txtnoidung], [anhmoi])
    })

    // Luu hinh anh 
    day = Date.now()

    form.on('fileBegin', function(name, file) {
        file.path = 'public/uploads/anhbaiviet/' + day + file.name;
    });

    form.on('file', function(name, file) {
        filename.push(day + file.name);
    });



    form.on('end', function() {
        let hinhanh = filename[0]
        hinhanh = hinhanh.split(',')
        if (!fields[0]) {
            res.json({
                code: 1,
                message: 'ID bài viết không hợp lệ'
            })
        } else {
            BaiViet.findOne({ _id: fields[0] }, (err, baiviet) => {
                if (err) {
                    console.log(err)
                } else {
                    Student.findOne({ _id: baiviet.manguoidung }, (err, student) => {
                        if (err) {
                            console.log(err)
                        } else {
                            BaiViet.updateOne({ _id: fields[0][0] }, { $set: { noidung: fields[1][0], hinhanh: hinhanh, video: '' } }, (err) => {
                                res.json({
                                    code: 0,
                                    txtnoidung: fields[1][0],
                                    hinhanh: hinhanh,
                                    fullname: student.fullname,
                                    anhdaidien: student.image,
                                    thoigianhienthi: baiviet.thoigianhienthi
                                })
                            })
                        }
                    })
                }
            })
        }
    });

    form.on('error', function() {
        res.end('Something went wrong on ther server side. Your file may not have yet uploaded.');
    });
})


Router.post('/koanhcuchinhsuabaivietkhongcoanhmoi', (req, res) => {
    var form = new formidable.IncomingForm();

    var filename = [];
    var fields = []
    form.parse(req, function(err, field, files) {
        const { id, txtnoidung, video } = field
        fields.push([id], [txtnoidung], [video])
    })

    form.on('end', function() {
        let video = ''
        if (fields[2][0]) {
            video = fields[2][0]
        }

        if (!fields[0]) {
            res.json({
                code: 1,
                message: 'ID bài viết không hợp lệ'
            })
        } else {
            BaiViet.findOne({ _id: fields[0] }, (err, baiviet) => {
                if (err) {
                    console.log(err)
                } else {
                    Student.findOne({ _id: baiviet.manguoidung }, (err, student) => {
                        if (err) {
                            console.log(err)
                        } else {
                            BaiViet.updateOne({ _id: fields[0][0] }, { $set: { noidung: fields[1][0], hinhanh: '', video: video } }, (err) => {
                                res.json({
                                    code: 0,
                                    txtnoidung: fields[1][0],
                                    fullname: student.fullname,
                                    anhdaidien: student.image,
                                    thoigianhienthi: baiviet.thoigianhienthi,
                                    video: video
                                })
                            })
                        }
                    })
                }
            })
        }
    });

    form.on('error', function() {
        res.end('Something went wrong on ther server side. Your file may not have yet uploaded.');
    });
})


// Đăng bình luận
Router.post('/dangbinhluan', (req, res) => {
    var form = new formidable.IncomingForm();

    moment().format('DD-MM-YYYY');
    const today = moment().format('DD-MM-YYYY HH:mm:ss');

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
            Student.findOne({ "_id": fields[1][0] }, (err, student) => {
                if (err) {
                    console.log(err)
                } else {
                    res.json({
                        code: 0,
                        mabaiviet: fields[0][0],
                        manguoidung: fields[1][0],
                        txtbinhluan: fields[2][0],
                        fullname: student.fullname,
                        hinhanh: student.image,
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

Router.post('/xoabinhluan', (req, res) => {

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
                message: 'ID bình luận không hợp lệ'
            })
        } else {
            BinhLuan.findByIdAndDelete({ '_id': fields[0] }, function(err, binhluan) {
                if (err) {
                    console.log(err)
                } else {
                    res.json({
                        code: 0,
                        data: binhluan,
                        message: 'Xoá bình luận thành công'
                    })
                }
            })
        }
    });
    form.on('error', function() {
        res.end('Something went wrong on ther server side. Your file may not have yet uploaded.');
    });
})

Router.get('/xemthongbao', isLoggedIn, (req, res) => {
    let perPage = 10
    let page = req.params.page || 1
    ThongBao.find({}, (err, thongbao) => {
        if (err) {
            console.log(err)
        } else {
            ThongBao.countDocuments((err, count) => {
                if (err) {
                    console.log(err)
                } else {
                    res.render('student', { page: 'xemthongbao', student: req.session.student, thongbao: thongbao, current: page, pages: Math.ceil(count / perPage) })
                }
            })
        }
    }).sort({ thoigian: -1 }).skip((perPage * page) - perPage).limit(perPage)
})


Router.get('/xemthongbao/:page', isLoggedIn, (req, res) => {
    let perPage = 10
    let page = req.params.page || 1
    ThongBao.find({}, (err, thongbao) => {
        if (err) {
            console.log(err)
        } else {
            ThongBao.countDocuments((err, count) => {
                if (err) {
                    console.log(err)
                } else {
                    res.render('student', { page: 'xemthongbao', student: req.session.student, thongbao: thongbao, current: page, pages: Math.ceil(count / perPage) })
                }
            })
        }
    }).sort({ thoigian: -1 }).skip((perPage * page) - perPage).limit(perPage)
})


Router.get('/xemthongbao/:phong_khoa/:page', isLoggedIn, (req, res) => {
    let perPage = 10
    let page = req.params.page || 1
    let phong_khoa = req.params.phong_khoa
    ThongBao.find({ 'phong_khoa': phong_khoa }, (err, thongbao) => {
        if (err) {
            console.log(err)
        } else {
            ThongBao.countDocuments({ 'phong_khoa': phong_khoa }, (err, count) => {
                if (err) {
                    console.log(err)
                } else {
                    res.render('student', { page: 'xemthongbaotheophongkhoa', student: req.session.student, thongbao: thongbao, current: page, pages: Math.ceil(count / perPage) })
                }
            })
        }
    }).sort({ thoigian: -1 }).skip((perPage * page) - perPage).limit(perPage)
})

Router.post('/xemthongbao', isLoggedIn, (req, res) => {
    phong_khoa = req.body.phong_khoa
    let perPage = 10
    let page = req.params.page || 1
    ThongBao.find({ 'phong_khoa': phong_khoa }, (err, thongbao) => {
        if (err) {
            console.log(err)
        } else {
            ThongBao.countDocuments({ 'phong_khoa': phong_khoa }, (err, count) => {
                if (err) {
                    console.log(err)
                } else {
                    res.render('student', { page: 'xemthongbaotheophongkhoa', phong_khoa, student: req.session.student, thongbao: thongbao, current: page, pages: Math.ceil(count / perPage) })
                }
            })
        }
    }).sort({ thoigian: -1 }).skip((perPage * page) - perPage).limit(perPage)
})


Router.get('/chitietthongbao/:id', isLoggedIn, (req, res) => {
    const id = req.params.id
    ThongBao.findById(id, (err, thongbao) => {
        if (err) {
            console.log(err)
        } else {
            res.render('student', { page: 'chitietthongbao', student: req.session.student, thongbao: thongbao })
        }
    })
})

Router.get('/trangcanhan', isLoggedIn, (req, res) => {
    Promise.all([Student.find({}), BaiViet.find({}).sort({ thoigian: -1 }), BinhLuan.find({}).sort({ thoigian: 1 }), Account.find({}), ThongBao.find({}).sort({ thoigian: -1 }).limit(5)])
        .then(result => {
            const [allstudent, allbaiviet, allbinhluan, allaccount, allthongbao] = result
            res.render('student', { page: 'trangcanhan', student: req.session.student, allbaiviet: allbaiviet, allstudent: allstudent, allbinhluan: allbinhluan, allaccount: allaccount, allthongbao: allthongbao })
        })
})

Router.get('/trangnguoidung/:id', isLoggedIn, (req, res) => {
    let id = req.params.id
    Promise.all([Student.find({}), Student.findById(id), BaiViet.find({}).sort({ thoigian: -1 }), BinhLuan.find({}).sort({ thoigian: 1 }), Account.find({}), ThongBao.find({}).sort({ thoigian: -1 }).limit(5)])
        .then(result => {
            const [allstudent, nguoidung, allbaiviet, allbinhluan, allaccount, allthongbao] = result
            res.render('student', { page: 'trangnguoidung', nguoidung: nguoidung, student: req.session.student, allbaiviet: allbaiviet, allstudent: allstudent, allbinhluan: allbinhluan, allaccount: allaccount, allthongbao: allthongbao })
        })
})


Router.get('/dangxuat', (req, res) => {
    req.session = null
    req.logout();
    res.redirect('/login');
})


module.exports = Router
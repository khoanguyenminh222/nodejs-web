const { check } = require('express-validator')

module.exports = [
    check('username')
    .exists().withMessage('Vui lòng cung cấp username')
    .notEmpty().withMessage('Username không được để trống')
    .isLength({ min: 4 }).withMessage('Username phải có tối thiểu 4 ký tự'),

    check('password')
    .exists().withMessage('Vui lòng cung cấp mật khẩu')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có tối thiểu 6 ký tự'),

    check('phong_khoa')
    .exists().withMessage('Vui lòng cung cấp phòng và khoa'),

    check('chuyenmuc')
    .exists().withMessage('Vui lòng cung cấp ít nhất 1 chuyên mục đăng bài'),
]
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BaiVietSchema = new Schema({
    manguoidung: String,
    noidung: String,
    hinhanh: [],
    thoigian: String,
    thoigianhienthi: String,
    video: String,
})
module.exports = mongoose.model('BaiViet', BaiVietSchema)
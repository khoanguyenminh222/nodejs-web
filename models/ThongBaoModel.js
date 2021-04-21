const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ThongBaoSchema = new Schema({
    tieude: String,
    noidung: String,
    phong_khoa: String,
    chuyenmuc: String,
    thoigian: String
})
module.exports = mongoose.model('ThongBao', ThongBaoSchema)
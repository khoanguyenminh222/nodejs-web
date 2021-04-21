const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BinhLuanSchema = new Schema({
    mabaiviet: String,
    manguoidung: String,
    txtbinhluan: String,
    thoigian: String
})
module.exports = mongoose.model('BinhLuan', BinhLuanSchema)
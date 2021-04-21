const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AccountSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    password: String,
    phong_khoa: {
        type: String,
        unique: true
    },
    image: {
        data: String,
        contenType: String
    },
    chuyenmuc: [String],
    chucvu: { type: String, default: 'Quanly' }
})
module.exports = mongoose.model('Account', AccountSchema)
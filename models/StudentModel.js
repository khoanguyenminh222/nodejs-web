const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StudentSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    fullname: String,
    image: String,
    class: String,
    faculty: String
})
module.exports = mongoose.model('Student', StudentSchema)
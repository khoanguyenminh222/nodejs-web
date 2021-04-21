const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport');
const cookieParser = require('cookie-parser')
const cors = require('cors')


// router
const LoginRouter = require('./routes/LoginRouter')
const AdminRouter = require('./routes/AdminRouter')
const StudentRouter = require('./routes/StudentRouter')
const GoogleRouter = require('./routes/GoogleRouter')
const QuanLyRouter = require('./routes/QuanLyRouter')


const GoogleStrategy = require('passport-google-oauth2').Strategy;
const configGG = require('./config/configLoginGG');

const app = express()
var http = require('http').createServer(app)
var io = require('socket.io')(http)

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())
app.use(session({
    secret: 'HelloWorld',
    resave: false,
    saveUninitialized: true,
    key: "sid"
}));

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));




//khởi tạo session
app.use(passport.initialize());
app.use(passport.session());

// Passport session setup. 

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});
// google
passport.use(new GoogleStrategy({
        clientID: configGG.google_key,
        clientSecret: configGG.google_secret,
        callbackURL: configGG.callback_url,
        passRegToCallback: true,
    },
    function(accessToken, refreshToken, profile, done) {
        return done(null, profile)
    }
));



// route
app.use('/', GoogleRouter)
app.use('/login', LoginRouter)
app.use('/', AdminRouter)
app.use('/student', StudentRouter)
app.use('/quanly', QuanLyRouter)

app.get('/error', (req, res) => {
    res.render('error')
})

app.all('*', (req, res) => res.json({ code: 101, message: 'Đường dẫn hoặc phương thức không được hỗ trợ' }))

//kết nối mongodb
mongoose.connect('mongodb+srv://khoanguyenminh222:khoa2703@cluster0.w19mv.mongodb.net/CuoiKi?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        http.listen(process.env.PORT, () => {
            console.log('http://localhost:' + 3000)

            io.on('connection', function(socket) {
                socket.on('messageSend', function(message) {
                    socket.broadcast.emit("messageSend", message)
                })
            })
        })
    })
    .catch(e => console.log('Không thể kết nối tới db server: ' + e.message))
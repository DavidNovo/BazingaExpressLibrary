// Welcome to my application object

// These are needed for the application object
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

// Define routes
var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var catalogRouter = require('./routes/catalog')

// Creating the application object
var app = express()

// connecting to the database
var mongoose = require('mongoose');
var mongoDB = 'mongodb://librarian:l1brar1an@ds117590.mlab.com:17590/local_library01';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console , 'MongoDB connection error'));


// view engine setup and add to application object
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// add logger to application object
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Add routes to the middleware stack
app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/catalog', catalogRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app

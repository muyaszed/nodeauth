const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const expressValidator = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const multer = require('multer');
const uploads = multer({dest: './uploads'});
const flash = require('flash');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const db = mongoose.connection;
const partials = require('express-partials');
const bcrypt = require('bcryptjs');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Handle session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

app.use(flash());



//passport
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/*', function(req,res,next) {
  req.session.flash = [];
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
